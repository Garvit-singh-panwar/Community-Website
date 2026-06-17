import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },

        question: {
            type: String,
            required: true
        },

        options: [
        {
            type: String,
            required: true
        }
        ],

        correctAnswer: {
            type: String,
            required: true
        },

        marks: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);


const Question = mongoose.model("Question" , questionSchema);
export default Question;