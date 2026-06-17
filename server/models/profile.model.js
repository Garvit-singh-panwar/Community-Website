import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
       
        user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },

        profilePic: {
            url: String,
            publicId: String
        },

        branch: {
            type: String,
            trim: true
        },

        year: {
            type: Number,
            min: 1,
            max: 4
        },

    },
    {
        timestamps: true
    }
);


const Profile = mongoose.model("Profile"  , profileSchema);

export default Profile;