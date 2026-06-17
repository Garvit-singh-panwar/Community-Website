import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },
        profile:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Profile"
        },
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Resource"
            }
        ],

        isVerified: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


userSchema.methods.compareHash = async function(givenPassword){

    const result = await bcrypt.compare(givenPassword , this.password);
    return result;
}


userSchema.pre("save" , async function(){
    if(!this.isModified("password")){
        return ;
    }
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(this.password , salt);
    this.password = newPassword;
        
})

const User = mongoose.model("User"  , userSchema);

export default User;