import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true
        },

        constraints: [String],

        sampleInput: {
            type: String,
            required: true
        },

        sampleOutput: {
            type: String,
            required: true
        },

        explanation: {
            type: String
        },

        testCases: [
        {
            input: {
                type: String,
                required: true
            },

            output: {
                type: String,
                required: true
            },

            isHidden: {
                type: Boolean,
                default: false
            }
        }
        ],

        points: {
            type: Number,
            default: 100
        },

        contest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true
        }
    },
    {
        timestamps: true
    }
);


const Problem = mongoose.model("Problem"  , problemSchema);

export default Problem;