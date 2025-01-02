import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Scheduler } from "../models/Scheduler.model.js";
import {uploadonCloudinary} from "../utils/cloudinary.js";
import {Employee} from "../models/Employee.model.js";

const GenerateAccessandRefreshToken = async (userId) => {
  try {
    const schedule = await Scheduler.findById(userId);
    if (!schedule) {
      throw new ApiError(404, "Schedule not found");
    }
    const accessToken = await schedule.GenerateAccessToken();
    const refreshToken = await schedule.GenerateRefreshToken();
    if (!accessToken || !refreshToken) {
      throw new ApiError(
        400,
        `Access token is:${accessToken} and refresh token is ${refreshToken}`
      );
    }
    schedule.refreshtoken = refreshToken;
    await schedule.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokes");
  }
};
const Loginscheduler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((val) => val?.trim() === "")) {
    throw new ApiError(400, "Email and password required in scheduler login");
  }
  const Schedulerexist = await Scheduler.findOne({
    email: email,
  });
  if (!Schedulerexist) {
    throw new ApiError(400, "Scheduler was unable to be found!!");
  }
  const isPasswordcorrect = await Schedulerexist.isPasswordcorrect(password);

  if (!isPasswordcorrect) {
    throw new ApiError(400, "Password is incorrect");
  }
  //note error lies here
  const { accessToken, refreshToken } = await GenerateAccessandRefreshToken(
    Schedulerexist._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  const currentloggedinscheduler = await Scheduler.findById(
    Schedulerexist._id
  ).select(" -password -refreshToken");

  return res
    .cookie("accesstoken", accessToken, options)
    .cookie("refreshtoken", refreshToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
          {
            currentloggedinscheduler,
            accessToken,
            refreshToken,
          },
        "Admin logged in success"
      )
    );
});

const logoutscheduler = asyncHandler(async (req, res) => {
  await Scheduler.findByIdAndUpdate(
    req.scheduler._id,
    {
      $set: {
        refreshtoken: undefined,
      },
    },
    {
      new: true,
    }
  );
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
});

const registerEmployee = asyncHandler(async (req, res) => {
  const {email, password,name} = req.body;


  if (!email || !password || !name) {
    throw new ApiError(400, "Email and password  and name is required");
  }

  const alreadyexists=await  Employee.findOne({email});
  if (alreadyexists) {
    throw new ApiError(400, "Employee already exists");
  }
  const localimgpath=req.file?.path

  if (!localimgpath) {
    throw new ApiError(400, "img is required");
  }
  const uploadedurl=uploadonCloudinary(localimgpath)
  if (!uploadedurl) {
    throw new ApiError(500, "image couldnt be uploaded");
  }

  const Employees=await Employee.create({
    email,
    name,
    password,
    empimg:uploadedurl,
    Schedulerid: req.scheduler.id
  })

  if (!Employees) {
    throw new ApiError(500, "Employee couldnt be created");
  }
  const updateScheduler=await Scheduler.findByIdAndUpdate(req.scheduler.id,
      {$push:{
          employeeid:Employees._id
        }},
      {options: {new: true}},
  )
  const createdemployee=await Employee.findById(Employees._id).select(("-password"))

  return res
      .status(200)
      .json(new ApiResponse(200,createdemployee,"Employee created successfully"))
})
export { logoutscheduler, Loginscheduler };
