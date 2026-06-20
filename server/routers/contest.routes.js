import express from "express";
// Middlewares
import { studentCheck , adminCheck , auth } from "../middlewares/auth.middleware.js";

// Controllers
import { createContest, createSubmission, deleteContest, deleteProblem, UploadProblem } from "../controllers/contest.controller.js";


const contestRouter = express.Router();

contestRouter.post("/", auth , adminCheck , createContest);
contestRouter.post("/problem/:id" , auth, adminCheck , UploadProblem);
contestRouter.delete("/problem/:id" , auth , adminCheck , deleteProblem);
contestRouter.delete("/:id" , auth , adminCheck , deleteContest);
contestRouter.post("/submit" , auth, studentCheck , createSubmission);


export default contestRouter;