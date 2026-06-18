import express from "express";

import { createProfile ,updateProfilePic ,updateProfile ,getMyQuizes , getMyResources , getMyContest, deleteUser } from "../controllers/user.controller";


import { auth , adminCheck , studentCheck } from "../middlewares/auth.middleware";

import { profileStorage } from "../config/cloudnary";
const uploadProfilePic = multer({ storage: profileStorage });

const userRouter = express.Router();



userRouter.post("/profile" ,auth , createProfile );
userRouter.post("/profile/:id" , auth ,uploadProfilePic.single('profilePic'),updateProfilePic);
userRouter.post("/profile/update" , auth , updateProfile);
userRouter.get("/quiz" , auth , adminCheck , getMyQuizes);
userRouter.get("/resource" , auth , studentCheck, getMyResources);
userRouter.get("/contest" , auth , adminCheck , getMyContest);
userRouter.delete("/" , auth , deleteUser);


export default userRouter;

