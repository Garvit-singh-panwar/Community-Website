import express from "express";
import { connectDb } from "./config/connectDb.js";
import { Env } from "./utils/Env.js";
import authRouter from "./routers/auth.router.js";

// parsing middleware
import { sanitize } from "./middlewares/sanitize.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import quizRouter from "./routers/quiz.routes.js";
import resourceRouter from "./routers/resource.routes.js";
import contestRouter from "./routers/contest.routes.js";
import userRouter from "./routers/user.router.js";




const port  = Env.PORT ?? 3000;
const app = express();

// parsing data middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  sanitize
);



// routes
app.use("/api/v1/auth" , authRouter);
app.use("/api/v1/quiz" , quizRouter);
app.use("/api/v1/resource" , resourceRouter);
app.use("api/v1/contest" , contestRouter);
app.use("api/v1/user" , userRouter);

// function to start application
const startApp = async()=>{
    try{
        await connectDb();
        app.listen(port , ()=>{
            console.log("server connected successfully at port " , port);
        })
    }
    catch(error){
        console.error("error while connecting to the server " , error);
        process.exit(1);
    }

};

startApp();