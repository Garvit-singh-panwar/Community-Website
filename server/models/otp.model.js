import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },
        email:{
            type: String,
            required: true,
            trim:true,
            lowercase:true,
        },
        otp:{
            type:String,
            required:true,
            maxLength: 6,
        },
        createdAt:{
            type:Date,
            default:Date.now,
            expires: 300,
        }
    }
);

const OTP = mongoose.model("OTP" , otpSchema);
export default OTP;