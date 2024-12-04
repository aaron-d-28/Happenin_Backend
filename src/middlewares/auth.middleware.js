import { User } from "../models/User.model.js";
import { Admin } from "../models/Admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import JWT from "jsonwebtoken";


export const  verifyJWT=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {
            throw new ApiError(401,"No such token found??")
    
        }
        const decodedToken=JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(400,"Invalid token")//todo Discuss about frontend
        }
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})

export const  verifyadminJWT=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {
            throw new ApiError(401,"No such token found??")
    
        }
        const decodedToken=JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await Admin.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(400,"Invalid token")//todo Discuss about frontend
        }
        req.Admin=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})