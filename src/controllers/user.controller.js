import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import {Admin} from "../models/Admin.model.js";

//steps when writing the insert booking remember to enter  +530 for everytime inserted query because it is witout time zone
// steps rather just use a js library for that time stuff
const GenerateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "user not found");
    }
    const accessToken = user.GenerateAccessToken();
    const refreshToken = user.GenerateRefreshToken();
    if (!accessToken || !refreshToken ) {
      throw new ApiError(400,`Access token is:${accessToken} and refresh token is ${refreshToken}`)
    }
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokes");
  }
};

const registeruser = asyncHandler(async (req, res) => {
  const { username, password, fullname, email, phone, user_location ,DOB} =
    req.body();

  if (
    [username, password, fullname, email, phone, user_location,DOB].some(
      (item) => item.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const usrimg = req.file?.userimage?.path;
  console.log(`Image local path is ${usrimg}`);
  if (!usrimg) {
    throw new ApiError(400, "Error has occured in the code");
  }
  let imageurl=""
  try {
    imageurl= await uploadonCloudinary(usrimg);
  } catch (error) {
    console.log(`Error found : ${error}`);
  }
  if (!imageurl) {
    throw new ApiError(400, `${imageurl} of urli image not found`);
  }
  console.log(`Image is uploaded online at url${imageurl}`);


  const user=await User.create({
    username, password, fullname, email, phone, user_location ,userimage:imageurl,DOB:new Date(DOB)
  })

  const userfound=await User.findById(user._id).select("-password")

  if (!userfound) {
    throw new ApiError(500,"Error user not created")

  }

  return res.
  status(200)
  .json(new ApiResponse(200,userfound,"User created successfully yayy!!"))
});

const loginuser=asyncHandler(async (req, res) => {
  const {email,password} = req.body

  const userfound=await  User.findOne({email:email})
  if (!userfound) {
    throw new ApiError(400,"Error user not found")
  }
  const passwordiscorrect=await userfound.isPasswordcorrect(password)
  if (passwordiscorrect) {
    throw new ApiError(400,"Error user password is incorrect")
  }
const {accessToken,refreshToken}=GenerateAccessandRefreshToken(userfound._id)
  if (!accessToken || !refreshToken) {
    throw new ApiError(400,"Error in creation of tokens")
  }
  const currentloggedinuser=await User.findById(userfound._id).select("-password")
  if (!currentloggedinuser) {
    throw new ApiError(400,"Error in creation of user")
  }

  const options={
    httpOnly: true,
    secure: true,
  }
  return res
      .cookie("accesstoken",accessToken,options)
      .cookie("refreshtoken",refreshToken,options)
      .status(200)
      .json(
          new ApiResponse(200,{currentloggedinuser,accessToken,refreshToken},"user logged in successful")
      )




})