import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },

        score: {
            type: Number,
            required: true
        },

        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question"
                },

                selectedOption: String,

                isCorrect: Boolean
            }
        ]
    },
    {
        timestamps: true
    }
);



const QuizAttempt = new mongoose.model("QuizAttemp" , quizAttemptSchema);

export default QuizAttempt;