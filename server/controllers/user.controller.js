import { v2 as cloudinary } from "cloudinary";
import Profile from "../models/profile.model.js"
import mongoose from "mongoose";
import Quiz from "../models/quiz.model.js";
import Resource from "../models/resource.model.js";
import Contest from "../models/contest.model.js";
import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";
import { deleteMultipleFromCloudinary } from "../config/cloudnary.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempted.model.js";

export const createProfile = async (req, res) => {
    try {

        const user = req.user._id;
        const { branch, year } = req.body || {};

        if (!branch || !year) {
            return res.status(400).json({
                success: false,
                message: "Required credentials"
            });
        }


        const parsedYear = Number(year);

        if (
            !Number.isInteger(parsedYear) ||
            parsedYear < 1 ||
            parsedYear > 4
        ) {
            return res.status(400).json({
                success: false,
                message: "Year must be between 1 and 4"
            });
        }

        const existingProfile = await Profile.findOne({ user });

        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: "Profile already exists"
            });
        }

        const profile = await Profile.create({
            user,
            branch,
            year: parsedYear
        });

        return res.status(201).json({
            success: true,
            profile,
            message: "Profile created successfully"
        });

    } catch (error) {

        console.error("error while creating profile", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


export const updateProfilePic = async (req, res) => {
    try {

        const user = req.user._id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Profile id is not valid"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file"
            });
        }

        const fileUrl = req.file.path;
        const publicId = req.file.filename;

        const profile = await Profile.findOne({
            _id: id,
            user
        });

        if (!profile) {

            // cleanup newly uploaded image
            const result = await cloudinary.uploader.destroy(publicId);

            if (
                result.result !== "ok" &&
                result.result !== "not found"
            ) {
                console.warn("Cloudinary cleanup issue:", result);
            }

            return res.status(403).json({
                success: false,
                message: "You cannot access this profile"
            });
        }

        // delete old profile pic
        if (profile.profilePic?.publicId) {
            try {
                await cloudinary.uploader.destroy(
                    profile.profilePic.publicId
                );
            } catch (err) {
                console.error("Failed to delete old profile pic", err);
            }
        }

        const updatedProfile = await Profile.findOneAndUpdate(
            {
                _id: id,
                user
            },
            {
                profilePic: {
                    url: fileUrl,
                    publicId
                }
            },
            {
                new: true
            }
        );

        return res.status(200).json({
            success: true,
            profile: updatedProfile,
            message: "Profile picture updated successfully"
        });

    } catch (error) {

        // cleanup newly uploaded image if DB update fails
        if (req.file?.filename) {
            try {
                await cloudinary.uploader.destroy(
                    req.file.filename
                );
            } catch (err) {
                console.error("cleanup failed", err);
            }
        }

        console.error("error while updating profile pic", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getMyQuizes = async(req,res)=>{
    try {
        
        const userId = req.user._id;
        
        const pageNo = req.query.pageNo ?? 0;
        const limit = 10;

        const myQuizes = await Quiz.find({createdBy: userId})
        .sort({createdAt:-1})
        .limit(limit)
        .skip(pageNo*limit);


        const total = await Quiz.countDocuments({createdBy:userId});

        const totalPages = Math.ceil(total/limit);

        return res.status(200).json(
            {
                success:true,
                message:"contest fetched successfully",
               myQuizes,
                pageNo,
                totalPages,
            }
        )

    } catch (error) {
       
      console.error("error while fetching my QUIZ" , error);
      res.status(500).json(
        {
            success:false,
            message: "Internal server error",
            error: error.message
        }
      );  
        
    }
}

export const getMyResources = async (req , res)=>{
    try {
        
        const userId = req.user._id;

        const pageNo = req.query.pageNo ?? 0;
        const limit = 10;

        const myResources = await Resource.find({uploadedBy: userId})
        .sort({createdAt:-1})
        .limit(limit)
        .skip(pageNo*limit);


        const total = await Resource.countDocuments({uploadedBy:userId});

        const totalPages = Math.ceil(total/limit);

        return res.status(200).json(
            {
                success:true,
                message:"contest fetched successfully",
                myResources,
                pageNo,
                totalPages,
            }
        )

    } catch (error) {
        console.error("error while fetching my QUIZ" , error);
        res.status(500).json(
            {
                success:false,
                message: "Internal server error",
                error: error.message
            }
        ); 
    }
}

export const getMyContest = async (req,res)=>{
    try {
        
        const userId = req.user._id;

        const pageNo = req.query.pageNo || 0;

        const limit = 30;

        const myContests = await Contest.find({createdBy: userId})
        .sort({createdAt:-1})
        .limit(limit)
        .skip(pageNo*limit);


        const total = await Contest.countDocuments({createdBy:userId});

        const totalPages = Math.ceil(total/limit);

        return res.status(200).json(
            {
                success:true,
                message:"contest fetched successfully",
                myContests,
                pageNo,
                totalPages,
            }
        )

    } catch (error) {
        console.error("error while fetching my QUIZ" , error);
        res.status(500).json(
            {
                success:false,
                message: "Internal server error",
                error: error.message
            }
        ); 
    }
}

export const updateProfile = async (req, res) => {
    try {

        const user = req.user._id;
        const { branch, year } = req.body || {};

        const id = req.params.id;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"incorrect profileId",
                }
            )
        }

        const existingProfile = await Profile.findOne({  _id: id });

        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        if(!existingProfile.user.equals(user)){
            return res.status(403).json(
                {
                    success:false,
                    message: "you are not allowed to make changes in this profile"
                }
            );
        }

        

        const dataToUpdate = {};

        if(branch?.trim()){
            dataToUpdate.branch = branch.trim();
        }

        if(year){

            
            const parsedYear = Number(year);

            if (
                !Number.isInteger(parsedYear) ||
                parsedYear < 1 ||
                parsedYear > 4
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Year must be between 1 and 4"
                });
            }

            dataToUpdate.year = parsedYear;
        }


        if(Object.keys(dataToUpdate).length === 0){
            return res.status(400).json(
                {
                    success:false,
                    message:"no data found to update"
                }
            )
        }

       

        const profile = await Profile.findByIdAndUpdate(id,
            dataToUpdate,{new:true}
        );

        return res.status(200).json({
            success: true,
            profile,
            message: "Profile updated successfully"
        });

    } catch (error) {

        console.error("error while updating profile", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



export const deleteUser = async(req,res)=>{
    try {
        
        const user = req.user;

        const profile = await Profile.findOne({
            user:user._id
        });

        if(profile?.profilePic?.publicId){
            await cloudinary.uploader.destroy(
                profile.profilePic.publicId
            );
        }

        await QuizAttempt.deleteMany({
            user:user._id
        });
        if (user.role === "admin") {

            const contests = await Contest.find({ createdBy: user._id });
            const problemIds = contests.flatMap(c => c.problems || []);

            if (problemIds.length > 0) {
                await Problem.deleteMany({ _id: { $in: problemIds } });
            }
            await Contest.deleteMany({ createdBy: user._id });


            const resources = await Resource.find({ uploadedBy: user._id });
            
            const publicIds = resources
                .map(res => res.file?.publicId)
                .filter(Boolean); 

            if (publicIds.length > 0) {
                await deleteMultipleFromCloudinary(publicIds);
            }
            await Resource.deleteMany({ uploadedBy: user._id });


            const quizzes = await Quiz.find({ createdBy: user._id });
            const questionIds = quizzes.flatMap(q => q.questions || []);

            if (questionIds.length > 0) {
                await Question.deleteMany({ _id: { $in: questionIds } });
            }
            await Quiz.deleteMany({ createdBy: user._id });
        }

        await User.findByIdAndDelete(user._id);

        return res.status(200).json(
            {
                success:true,
                message:"User deleted successfully"
            }
        )

    } catch (error) {
        return res.status(500).json(
            {
                success:false,
                error:error.message,
                message:"Internal server error"
            }
        )
    }
}