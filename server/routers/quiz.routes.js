import express from "express";

// Controllers
import { createQuiz, deleteQuestions, deleteQuiz, getQuiz, getQuizById, leaderBoard, submitQuiz, updateQuiz, uploadQuestions } from "../controllers/quiz.controller.js";

// middlewares
import { adminCheck, auth, studentCheck } from "../middlewares/auth.middleware.js";

const quizRouter = express.Router();

// routes
quizRouter.get("/" , auth ,studentCheck, getQuiz);
quizRouter.get("/:id" ,auth , studentCheck , getQuizById);
quizRouter.get("/leaderboard/:id" , auth , leaderBoard);
quizRouter.post("/" , auth ,adminCheck , createQuiz);
quizRouter.post("/question/:id",auth , uploadQuestions);
quizRouter.post("/submit/:id",auth,studentCheck , submitQuiz); 
quizRouter.put("/:id", auth,adminCheck, updateQuiz );
quizRouter.delete("/question/:id",auth , adminCheck, deleteQuestions);

quizRouter.delete("/:id", auth,
  adminCheck, deleteQuiz);

export default quizRouter;



