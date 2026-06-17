import express from 'express';

// Controllers
import { login, logout, register, verifyotp ,verifyMe  } from '../controllers/auth.controller.js';
// Middlewares
import { adminCheck, auth, studentCheck } from '../middlewares/auth.middleware.js';


const authRouter = express.Router();


// Routes
authRouter.post("/register" , register);
authRouter.post("/login" , login);
authRouter.post("/verify-otp" , verifyotp);
authRouter.get("/logout" , logout);
authRouter.get("/student" ,auth , studentCheck , verifyMe );
authRouter.get("/admin",auth,adminCheck , verifyMe);


export default authRouter;


