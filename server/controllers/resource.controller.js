import Resource from "../models/resource.model.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";



const VALID_TYPES = ["pyq", "syllabus", "notes"];
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const uploadResource = async (req, res) => {
    try {
        // Safe Check: Guard against missing file uploads immediately
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select and upload a file.",
            });
        }

        const uploadedBy = req.user._id;
        const fileUrl = req.file.path; 
        const publicId = req.file.filename;
        const originalName = req.file.originalname;
        const sizeInBytes = req.file.size; 

        const size = (sizeInBytes / (1024 * 1024)).toFixed(2);
        
        const { title, description, type, subject, semester } = req.body;

        // 2. Updated Validation: Clean up Cloudinary if fields are missing
        if (!title || !description || !type || !subject || !semester) {
            
            // Delete the uploaded file from Cloudinary since the database record failed
            await cloudinary.uploader.destroy(publicId);

            return res.status(400).json({
                success: false,
                message: "All form fields are required.",
            });
        }

        if (isNaN(parseInt(semester))) {
            await cloudinary.uploader.destroy(publicId);
            return res.status(400).json({ success: false, message: "Semester must be a number" });
        }

        const file = {
            url: fileUrl,
            publicId,
            originalName,
            size,
        };

        const resource = await Resource.create({
            title,
            description,
            type,
            subject,
            semester : parseInt(semester),
            file,
            uploadedBy
        });

        return res.status(201).json({
            success: true,
            message: "File uploaded successfully",
            resource,
        });

    } catch (error) {
        console.error("Error while uploading the resource: ", error);
        
        // 3. Fallback Clean-up: If a DB error happens after successful upload, delete the asset
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (destroyError) {
                console.error("Failed to delete orphaned Cloudinary file: ", destroyError);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const deleteResource = async(req,res)=>{
    try {
        
        const uploadedBy = req.user._id;
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"incorrect resource id"
                }
            );
        }

        const resource = await Resource.findOne({_id:id , uploadedBy});

        if(!resource){
            return res.status(403).json(
                {
                    success:false,
                    message: "you are not allowed to delete this resource",
                }
            );
        }


        await Resource.findByIdAndDelete(id);

        try {
            await cloudinary.uploader.destroy(resource.file.publicId);
        } catch (cloudinaryError) {
            console.error("Cloudinary delete failed, manual cleanup needed:", resource.file.publicId);
            // Don't throw — DB is already clean, this is just storage cleanup
        }
        

        return res.status(200).json(
            {
                success:true,
                message:"resource deleted successfully"
            }
        );  




    } catch (error) {
     
        console.error("error while deleting the resource " , error);
        res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error: error.message,
            }
        );
        
    }
}



export const searchResource = async (req, res) => {
    try {

        const { search, type, subject, semester, page = 1, limit = 10 } = req.query;

        // Validate type early
        if (type && !VALID_TYPES.includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid resource type" });
        }

        if (search && search.length > 100) {
            return res.status(400).json({ success: false, message: "Search query too long" });
        }

        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: escapeRegex(search), $options: "i" } },
                { description: { $regex: escapeRegex(search), $options: "i" } }
            ];
        }

        if (type) query.type = type;
        if (subject) query.subject = subject;
        if (semester) query.semester = parseInt(semester);

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.min(parseInt(limit) || 10, 50); // cap at 50
        const skip = (pageNum - 1) * limitNum;

        const [resources, totalResources] = await Promise.all([
            Resource.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate("uploadedBy", "name email"),
            Resource.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            pagination: {
                totalItems: totalResources,
                currentPage: pageNum,
                totalPages: Math.ceil(totalResources / limitNum),
                itemsPerPage: limitNum
            },
            resources
        });

    } catch (error) {
        console.error("Error while fetching resources: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


export const getResourceById = async (req,res)=>{
    try {
        
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"invalid resource id"
                }
            )
        }

        const resource = await Resource.findById(id)
        .select("title description type subject semester file uploadedBy createdAt")
        .populate("uploadedBy", "name email");

        return res.status(200).json(
            {
                success:true,
                message:"file fetched successfully",
                file: resource.file
            }
        )


    } catch (error) {
        
        console.error("error in fetching the resource " , error);
        return res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error: error.message
            }
        )

    }
};