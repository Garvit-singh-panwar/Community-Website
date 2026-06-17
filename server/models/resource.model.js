import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["notes", "pyq", "syllabus"],
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        semester: {
            type: Number,
            min:1 , 
            max:8,
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        file: {
            url: {
                type: String,
                required: true
            },

            publicId: {
                type: String,
                required: true
            },

            originalName: String,

            size: Number
        },

        downloads: {
            type: Number,
            default: 0
        },

        approved: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Resource = mongoose.model("Resource" , resourceSchema);
export default Resource;