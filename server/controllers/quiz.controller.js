import Quiz from "../models/quiz.model.js"
import Question from "../models/question.model.js";
import mongoose from "mongoose";
import QuizAttempt from "../models/quizAttempted.model.js";

export const createQuiz = async(req,res)=>{
    try{

        const createdBy = req.user._id;
        const {title ,description , duration } = req.body;

        if(!title || !description || !duration){
            return res.status(400).json(
                {
                    success:false,
                    message: "need Required data",
                }
            );
        }

        const quiz = await Quiz.create({
            title,
            description,
            duration,
            createdBy,
            isActive:false,
        });


        res.status(201).json({
            success:true,
            quiz,
            message:"quiz created successfully"
        });




    }
    catch(error){
        console.error( "error while creating the quiz", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );

    }
}

export const uploadQuestions = async(req,res)=>{
    try{

        

        const quizId = req.params.id;
        const userId = req.user._id;
        const {questions} = req.body;


        if(!mongoose.Types.ObjectId.isValid(quizId)){
            return res.status(400).json(
                {
                    success:false,
                    message:"Incorrect QuizId"
                }
            );
        }

        
        const quiz = await Quiz.findById(quizId);

        if(!quiz){
            return res.status(404).json(
                {
                    success:false,
                    message:"Quiz not found"
                }
            )
        }

        if(!quiz.createdBy.equals(userId)){
            return res.status(403).json(
                {
                    success:false,
                    message: "you are not to make changes in this quiz ",
                }
            );
        }

        if(!questions || !Array.isArray(questions)){
            return res.status(400).json(
                {
                    success:false,
                    message: "Required questions"
                }
            );
        }


        const isValid = questions.every((q) => {
            return (
                q.question &&
                q.correctAnswer &&
                typeof q.marks === "number" &&
                Array.isArray(q.options) &&
                q.options.length >= 2 &&
                q.options.includes(q.correctAnswer)
            );
        });


       

        if(!isValid){
            return res.status(400).json({
                success:false,
                message:  "Invalid question format",
            });
        }




       

        const updatedQuestions = questions.map((q) => ({
                                                    ...q,
                                                    quiz: quizId,
                                                }));
                                                
        const newQuestions = await Question.insertMany(updatedQuestions);

        const ids = newQuestions.map((q) => q._id);;
        const marks = questions.reduce((sum ,q)=>{
            return sum+=q.marks;
        }, 0);


        const updatedQuiz = await Quiz.findByIdAndUpdate(
                                quizId,
                                {
                                    $push: {
                                        questions: {
                                            $each: ids,
                                        },
                                    },
                                    $inc: {
                                        totalMarks: marks,
                                    },
                                    isActive:true
                                },
                                {
                                    new: true,
                                }
                            );

        return res.status(200).json(
            {
                success:true,
                updatedQuiz,
                message:"Questions uploaded successfully",
            }
        );

    }

    
    catch(error){
        console.error( "error while uploading the questions in the quiz", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );

    }
}

export const updateQuiz = async(req,res)=>{
    try{

        
        const createdBy = req.user._id;
        const id = req.params.id;
        const {title ,description , duration } = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"Quiz id is not valid"
                }
            );
        }



        const quiz = await Quiz.findById(id);

        if(!quiz){
            return res.status(404).json(
                {
                    success:false,
                    message: "quiz not found",
                }
            )
        }

        if(!quiz.createdBy.equals(createdBy)){
            return res.status(403).json(
                {
                    success:false,
                    message:"you are not allowed to access this route"
                }
            )
        }

        let dataToUpdate = {};

        if(title){
            dataToUpdate.title = title;
        }

        if(description){
            dataToUpdate.description = description;
        }

        if(duration){
            dataToUpdate.duration = duration;
        }

        if(Object.keys(dataToUpdate).length < 1){
            return res.status(400).json(
                {
                    success:false,
                    message: "send required fields to update"
                }
            );
        }



        const updatedQuiz = await Quiz.findByIdAndUpdate(id , dataToUpdate);

        return res.status(200).json(
            {
                success:true,
                message: "Data updated Successfully"
            }
        )

    }
    catch(error){
        console.error( "error while updating the quiz ", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );

    }
}

export const deleteQuiz = async(req,res)=>{
    try{

        
        const createdBy = req.user._id;
        const id = req.params.id;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"Quiz id is not valid"
                }
            );
        }



        const quiz = await Quiz.findOne({_id: id });

        if(!quiz){
            return res.status(404).json(
                {
                    success:false,
                    message:"Quiz not found"
                }
            )
        }

        if(!quiz.createdBy.equals(createdBy)){
            return res.status(403).json(
                {
                    success:false,
                    message: "you are not to make changes in this quiz ",
                }
            );
        }



        await Question.deleteMany({ _id: { $in: quiz.questions } });

        await Quiz.findByIdAndDelete(id);

        return res.status(200).json(
            {
                success:true,
                message: "Data updated Successfully"
            }
        );

    }
    catch(error){
        console.error( "error while deleting the quiz ", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );

    }
}

export const deleteQuestions = async(req,res)=>{
    try {
        
        const createdBy = req.user._id;
        const id = req.params.id;

        
        const quiz = await Quiz.findOne({
            _id: id,
            createdBy
        });

        if(!quiz){
            return res.status(403).json(
                {
                    success:false,
                    message:"you are not allowed to make changes in this Quiz"
                }
            )
        }

        const {questions} = req.body;

        if(!questions || !Array.isArray(questions)){
            return res.status(400).json(
                {
                    success:false,
                    message: "required questions ",
                }
            )
        }

        let isValid = true;
        isValid = questions.every(e =>{ 
            
            return mongoose.Types.ObjectId.isValid(e)
        });

        if(!isValid){
            return res.status(400).json(
                {
                    success:false,
                    message: "required data in valid format"
                }
            );
        }


       const deletedQuestions = await Question.find({
            _id: { $in: questions },
            quiz: id
        });


        if (!deletedQuestions.length) {
            return res.status(404).json({
                success: false,
                message: "No questions found to delete"
            });
        }

        await Question.deleteMany({
            _id: { $in: questions },
            quiz: id
        });


        const marks = deletedQuestions.reduce((sum , q) =>{
            return sum += (q.marks || 0);
        } , 0)

        await Quiz.findByIdAndUpdate( id , 
                                        {
                                            $pull : 
                                                {questions:  
                                                        { 
                                                            $in: questions
                                                        }
                                                },
                                            $inc: {
                                                totalMarks : -marks 
                                            }
                                        },
                                    );

        return res.status(200).json(
            {
                success:true,
                message: "questions deleted successfully"
            }
        )


    } catch (error) {
        
        console.error("questions deleted successfully" , error);
        res.status(500).json(
            {
                success:false,
                message: "Internal server error",
                error: error.message
            }
        );

    }
}

export const getQuiz = async (req, res) => {
    try {
        const pageNo = parseInt(req.query.page) || 0;
        const limit = 30;

        const quizes = await Quiz.find({isActive: true})
            .select("title description duration totalMarks")
            .limit(limit)
            .skip(limit * pageNo);


        const total = await Quiz.countDocuments({
            isActive: true
        });

        const totalPages = Math.ceil(total/limit) ;

        return res.status(200).json({
            success: true,
            quizes,
            pageNo,
            totalPages,
            message: "quiz fetched successfully",
        });



    } catch (error) {
        console.error("error while fetching the quiz", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getQuizById = async(req,res)=>{
    try {
        
        const id = req.params.id;


        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json(
                {
                    success:false,
                    message:"Quiz id is not valid",
                }
            )
        }


        const quiz = await Quiz.findOne({
            _id: id,
            isActive: true
        })
        .select("title description duration totalMarks questions")
        .populate("questions", "-correctAnswer");;

        if(!quiz){
            return res.status(404).json(
                {
                    success:false,
                    message:"quiz not found for given id"
                }
            );
        }

        res.status(200).json(
            {
                success:true,
                quiz,
                message: "quiz fetched successfully"
            }
        )

    } catch (error) {
        console.error("error while retriving the quiz" , error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message:"Internal server error"
            }
        )
    }
}

export const submitQuiz = async (req, res) => {
    try {
        const { response } = req.body;
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Quiz id",
            });
        }


        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        if (!quiz.isActive) {
            return res.status(400).json({
                success:false,
                message:"Quiz is not active"
            });
        }
        const alreadySubmitted = await QuizAttempt.findOne({ user: userId, quiz: id });
        if (alreadySubmitted) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted this quiz"
            });
        }

        if (!response || !Array.isArray(response)) {
            return res.status(400).json({
                success: false,
                message: "Response are required and must be an array format"
            });
        }

        const isValid = response.every((e) => {
            return (
                e.questionId &&
                e.answer &&
                mongoose.Types.ObjectId.isValid(e.questionId)
            );
        });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Response should be in the right format"
            });
        }

        // 3. Extract Question IDs & Fetch from Database
        const questionIds = response.map(e => e.questionId);

        const uniqueIds = new Set(questionIds);

        if(uniqueIds.size !== questionIds.length){
            return res.status(400).json({
                success:false,
                message:"Duplicate question responses found"
            });
        }

        const savedQuestions = await Question.find({
            _id: { $in: questionIds },
            quiz: id
        });

        // 4. Calculate Score
        let score = 0;

        // Detailed breakdown to send back to the client
        const assessmentDetails = savedQuestions.map((dbQuestion) => {
            // FIX: Call .equals on the Mongoose ID, or cast both to string
            const userResponse = response.find(r => dbQuestion._id.toString() === r.questionId.toString() );

            const isCorrect = dbQuestion.correctAnswer === userResponse?.answer;

            if (isCorrect) {
                // Ensure marks defaults to 1 if it's not specified in your schema
                score += dbQuestion.marks || 1; 
            }

            return {
                questionId: dbQuestion._id,
                selectedOption: userResponse?.answer,
                isCorrect
            };
        });

        // 5. Store Attempt (FIX: Watch your Model spelling here)
        const submission = await QuizAttempt.create({
            user: userId,
            quiz: id,
            score,
            answers: assessmentDetails,
        });

        return res.status(201).json({
            success: true,
            message: "Submitted successfully",
            totalMarks: quiz.totalMarks,
            score: submission.score,
            submission,
        });

    } catch (error) {
        console.error("Error while submitting the quiz:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const leaderBoard =  async(req,res)=>{
    try {
        
        const { id } = req.params;


        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid quiz id" });
        }

        const leaderboard = await QuizAttempt.find({quiz: id})
                            .sort({ score: -1  , createdAt: 1}) 
                            .limit(100)
                            .populate("user", "name email");


        const rankedLeaderboard =   leaderboard.map((entry,index)=>({
            rank:index+1,
            ...entry.toObject()
        }));

        return res.status(200).json(
            {
                success:true,
                message:"Quiz leaderboard",
                leaderboard: rankedLeaderboard,
            }
        );

    } catch (error) {
        
        console.error(error);
        return res.status(500).json(
            {
                success:false,
                message: "Internal server error",
                error: error.message,
            }
        );

    }
}