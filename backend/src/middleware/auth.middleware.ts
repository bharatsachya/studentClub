import { ApiError } from "../utils/ApiHandler";
import { asyncHandler } from "../utils/asynchandler";
import { User } from "../models/user.model";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request } from "express";
dotenv.config();    

interface JwtPayload {
  _id: string;
  email: string;
  iat: number;
  exp: number;
}

export const verifyJWT = asyncHandler(async(req :Request,res,next)=>{
    try {
         const token = req.cookies?.accessToken || (req.headers["authorization"]?.replace("Bearer", "").trim())   
            if(!token){
                throw new ApiError(401,"unauthorized user")           }
            const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET as string)
    
           const payload = typeof decodedToken === "string" ? null : decodedToken as jwt.JwtPayload;
           const userId = payload?._id;
           const user = await User.findById(userId).select("-refershToken, -password")
    
           if(!user){
                  throw new ApiError(401,"unauthorized user")
               }    
           req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,"unauthorized user")
    }
})