import { genSalt } from "bcryptjs";
import OTP from "../models/otp.model.js";
import User from "../models/user.model.js"
import { sendRegisterationOTP } from "../utils/email.js";
import { generateOtp } from "../utils/generateOtp.js";
import { generateToken } from "../utils/generateToken.js";


export const register = async(req,res)=>{
    try{

        // taking and Checking the credentials
        const {name ,  password} = req.body || {};;

        const email = req.body?.email?.trim()?.toLowerCase();

        if(!email || !password || !name ){
            return res.status(400).json(
                {
                    success: false,
                    message: "All the fields are required ",
                }
            );
        }


        // checking the email format 
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if(!regex.test(email)){
            return res.status(400).json(
                {
                    success:false,
                    message:"incorrect Email format",
                }
            );
        }

        // verify the user 

        const isUser  = await User.findOne({email});
        if(isUser){

            // if user present and verified do this 
            if(isUser.isVerified){
                return res.status(409).json(
                    {
                        success:false,
                        message:"User already Present for given email",
                    }
                );
            }
            // if user is present but not verified do this 
            else{
                const existingOtp = await OTP.findOne({
                    user: isUser._id,
                    email,
                });

                if (existingOtp) {
                    return res.status(200).json({
                        success: true,
                        message: "You are already registered. OTP has already been sent."
                    });
                }

                const otp = generateOtp();

                await OTP.create(
                    {
                        otp,
                        user: isUser._id,
                        email: email,
                    }
                );

                await sendRegisterationOTP(
                    isUser.name,
                    email,
                    otp
                );

                return res.status(200).json(
                    {
                        success:true,
                        message: "you are already registered ,otp send successfully to your account please verify"
                    }
                );

            }
           
        }


        // checking the password length 
        if(password.length < 8){
            return res.status(400).json(
                {
                    success:false,
                    message: "password length should be atleast 8",
                }
            )
        }

        // making the new user

        const newUser = new User(
            
            {
                name,
                email,
                password,
                isVerified: false,
            }
        );

        await newUser.save();

        // generating otp 
        const otp = generateOtp();

        // creating OTP 
        await OTP.create(
            {
                user: newUser._id,
                email: newUser.email,
                otp: otp,
            }
        );

        // sending the OTP
        await sendRegisterationOTP(name , email , otp);


        
        newUser.password = undefined;

        // sending the response
        return res.status(201).json(
            {
                success:true,
                user:newUser,
                message:"veriy your account using Otp"
            }
        );
    }
    catch(error){
        console.error( "error while register ", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );

    }
}



export const login = async(req,res)=>{
    try{

        const {email , password} = req.body || {};
         
        if(!email || !password){
            return res.status(400).json(
                {
                    success:false,
                    message: "Required all the credentails",

                }
            );
        }

        // Checking the email format 
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if(!regex.test(email)){
            return res.status(400).json(
                {
                    success:false,
                    message:"incorrect Email format",
                }
            );
        }

        // verify the user 

        const user  = await User.findOne({email});
        if(!user){
            return res.status(404).json(
                {
                    success:false,
                    message: "User not found"
                }
            );
        }

        if(!user.isVerified){
            return res.status(403).json(
                {
                    success:false,
                    message: "please verify your account"
                }
            );
        }

        const isMatch = await user.compareHash(password);
        if(!isMatch){
            return res.status(401).json(
                {
                   success:false,
                   message:"invalid password", 
                }
            );
        }

        user.password = undefined;
        generateToken(res,user._id);
        return res.status(200).json(
            {
                success:true,
                user: user,
                message: "user logged in successfully",
            }
        );



    }
    catch(error){
        console.error( "error while login ", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );

    }
}



export const verifyotp = async(req,res)=>{
    try{

        const { otp, email } = req.body || {};


        if (!otp || !email) {
            return res.status(400).json({
                success: false,
                message: "All fields (otp, email) are required.",
            });
        }

        
        const otpRecord = await OTP.findOne({ email:email , otp:otp });
        
        console.log(otpRecord);
        if (!otpRecord) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired OTP.",
            });
        }

        

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        

        await User.findByIdAndUpdate(user._id, { isVerified: true });


        await OTP.deleteOne({ _id: otpRecord._id });

        
        generateToken(res, user._id);
        
        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
        });
    }
    catch(error){
        console.error( "error while verifying the token ", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );

    }
}

export const logout = async (req,res)=>{
    try {
        
        res.clearCookie("token",{
            httpOnly: true,
            sameSite: "lax",
            secure:false,
        });
        res.status(200).json(
            {
                success:true,
                message: "user logout successfully"
            }
        );

    } catch (error) {
        console.error( "error while verifying the token ", error);
        return res.status(500).json(
            {
                success:false,
                error: error.message,
                message: "Internal server error"
            }
        );
    }
} 


export const verifyMe = async(req,res)=>{
    try {
        
        return res.status(200).json(
            {
                success: true,
                message:"user verified successfully"
            }
        )

    } catch (error) {
        
        console.error("error in verifyMe controller " , error);
        return res.status(500).json(
            {
                success:false,
                message:"Internal server error",
                error:error.message,
            }
        );

    }
}