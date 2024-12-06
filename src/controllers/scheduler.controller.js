import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Scheduler } from "../models/Scheduler.model.js";
import mongoose from "mongoose";

const GenerateAccessandRefreshToken = async (userId) => {
    try {
      const schedule = await Scheduler.findById(userId);
      const accessToken = Scheduler.GenerateAccessToken();
      const refreshToken = Scheduler.GenerateRefreshToken();
  
      schedule.refreshtoken = refreshToken;
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "Something went wrong while generating tokes");
    }
  };
const Loginscheduler=asyncHandler(async(req,res)=>{
    const {email,password}=req.body

    if ([email,password].some((val)=>val?.trim()===""))
    {
        throw new ApiError(400,"Email and password required in scheduler login")
    }
    const Schedulerexist=await Scheduler.findById(
        {
            email:email
        }
    )
    if (!Schedulerexist)
    {
        throw new ApiError(400,"Scheduler was unable to be found!!")
    }

    const isPasswordcorrect=await Schedulerexist.isPasswordcorrect(Schedulerexist._id)

    if (!isPasswordcorrect) {
        throw new ApiError(400,"Password is incorrect")
    }
     
    const {accessToken,refreshToken}=await GenerateAccessandRefreshToken(Schedulerexist._id)

    const options={
        httpOnly: true,
        secure: true,
      }

      const currentloggedinscheduler=Scheduler.findById(Schedulerexist._id).select(" -password -refreshToken")

      return res
  .cookie("accesstoken",accessToken,options)
  .cookie("refreshtoken",refreshToken,options)
  .status(200)
  .json(
    new ApiResponse(200,currentloggedinscheduler,accessToken,refreshToken,"Admin logged in success")
  )
})

const logoutscheduler=asyncHandler(async(req,res)=>{
  await Scheduler.findByIdAndUpdate(
    req.scheduler._id,
    {
      $set:{
        refreshtoken:undefined
      }
    },
    {
      new:true
    }
  )
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
  .status(200)
  .clearCookie("accesstoken", options)
  .clearCookie("refreshtoken", options)
  .json(
    new ApiResponse(
      200,
      {},
      "Schdeduler logged out successfully!!!!!!!!!!!!!!!!!!!!!"
    )
  );

})