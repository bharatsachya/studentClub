import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"],

    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,
        required:false
    },
    refreshToken:{
        type:String,
        required:false
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password :string){
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAcessToken = function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },
    process.env.ACESS_TOKEN_SECRET as string,
    {
        expiresIn:process.env.ACESS_TOKEN_EXPIRY
    }
)

}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    },
   )
}
export const User = mongoose.model('User',userSchema);