import jwt  from "jsonwebtoken";
import { Env } from "./Env.js";

export const generateToken = (res, userID)=>{
        
        const token = jwt.sign({id:userID} ,Env.JWT_SECRET , {expiresIn:"3d"});

        const cookieOptions = {
            httpOnly: true,
            secure:false,
            sameSite: "lax",
            maxAge: (3*24*60*60*1000)
        }

        res.cookie("token" , token , cookieOptions);

}