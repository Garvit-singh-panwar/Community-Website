import User from "../models/user.model.js";
import jwt from  "jsonwebtoken";
import {Env} from "../utils/Env.js"


// AUth middleware
export const auth = async(req,res,next)=>{

    try {
        
        // fetching Token
        const token = 
            req.cookies?.token || 
            req.header("Authorization")?.replace("Bearer ", "") || 
            req.body?.token;

        // If not present sending the response
        if(!token){
            return res.status(400).json(
                {
                    success:false,
                    message:"Please login again "
                }
            );
        }



        // Opening the token if not presesnt it will throw error handle in catch
        const decoded = jwt.verify(token , Env.JWT_SECRET);


        // fetching the user from the id fetched from the token 
        const user = await User.findById(decoded.id);

        // if user is account is not present throw the error
        if(!user){
            return res.status(404).json(
                {
                    success:false,
                    message:"User not found",
                }
            );
        }


        // sending the user data in req 
        req.user = user;
        // going to next middleware or controller
        next();

        // hnadling the error
    } catch (error) {
        
        console.error("error in the auth middleware" , error);
        
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please log in again."
            });
        }

        res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error: error.message
            }
        ); 

    }

}

// cheching the role of the user here Admin role
export const adminCheck = async(req,res,next)=>{
    try {
        
        // saving role 
        const role = req.user.role

        // checking its Admin or not if not send the response
        if(role !== "admin"){
            return res.status(403).json(
                {
                    success:false,
                    message:"you are not allowed to access this route",
                }
            );
        }


        // going to the next controller
        next();

    } catch (error) {
        console.error("error while checking the admin role " , error);
        return res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error:error.message,
            }
        );
    }
}



// Checking Student Role
export const studentCheck = async(req,res,next)=>{
    try {
        
        // fetching role from the req
        const role = req.user.role

        // if not student send response
        if(role !== "student"){
            return res.status(403).json(
                {
                    success:false,
                    message:"you are not allowed to access this route",
                }
            );
        }


        // if student go to next controller or middleware
        next();

    } catch (error) {
        console.error("error while checking the student role " , error);
        return res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error:error.message,
            }
        );
    }
}
