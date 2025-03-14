import { User } from "../models/Mongoose.odm/User.model.js";
import { Admin } from "../models/Mongoose.odm/Admin.model.js";
import { Scheduler } from "../models/Mongoose.odm/Scheduler.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import JWT from "jsonwebtoken";
import {Employee} from "../models/Mongoose.odm/Employee.model.js";


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
   if (!req.Admin) {
    try {
        const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {
            throw new ApiError(401,"No such token found?? login first")
    
        }
        const decodedToken=JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await Admin.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(400,"Invalid token")//todo Discuss about frontend
        }
        req.Admin=user;
        console.log(`req.admin is ${req.Admin.name}`)
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
   }
   else
   {
    console.log("User admin already exists logged in")
    next()
   }
})


export const  verifyschedulerJWT=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {
            throw new ApiError(401,"No such token found??")
    
        }
        const decodedToken=JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await Scheduler.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(400,"Invalid token")//todo Discuss about frontend
        }
        req.scheduler=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})


export const  verifyemployee=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {
            throw new ApiError(401,"No such token found??")

        }
        const decodedToken=JWT.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user=await Employee.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(400,"Invalid token")//todo Discuss about frontend
        }
        req.employee=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }
})