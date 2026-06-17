import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        problems: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Problem"
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


const Contest = mongoose.model("Contest"  , contestSchema);

export default Contest;