import express from "express";

import { createProfile ,updateProfilePic ,updateProfile ,getMyQuizes , getMyResources , getMyContest, deleteUser } from "../controllers/user.controller.js";

import multer from "multer";

import { auth , adminCheck , studentCheck } from "../middlewares/auth.middleware.js";

import { profileStorage } from "../config/cloudnary.js";
const uploadProfilePic = multer({ storage: profileStorage });

const userRouter = express.Router();



userRouter.post("/profile" ,auth , createProfile );
userRouter.patch("/profile/:id" , auth ,uploadProfilePic.single('profilePic'),updateProfilePic);
userRouter.put("/profile/:id" , auth , updateProfile);
userRouter.get("/quiz" , auth , adminCheck , getMyQuizes);
userRouter.get("/resource" , auth , studentCheck, getMyResources);
userRouter.get("/contest" , auth , adminCheck , getMyContest);
userRouter.delete("/" , auth , deleteUser);


export default userRouter;

