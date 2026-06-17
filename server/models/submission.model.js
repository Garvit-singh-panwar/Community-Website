import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        contest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true
        },

        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true
        },

        code: {
            type: String,
            required: true
        },

        language: {
            type: String,
            enum: ["cpp", "java", "python", "javascript"],
            required: true
        },

        verdict: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "Time Limit Exceeded",
                "Runtime Error"
            ],
            default: "Wrong Answer"
        },

        pointsAwarded: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Submission =  mongoose.model("Submission", submissionSchema);
export default Submission;