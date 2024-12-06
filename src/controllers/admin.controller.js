import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { Admin } from "../models/Admin.model.js";
import { Scheduler } from "../models/Scheduler.model.js";

//note this is seen in the admin panel therefore scheduler is set in admin controller

const GenerateAccessandRefreshToken = async (userId) => {
  try {
    const admin = await Admin.findById(userId);
    const accessToken = admin.GenerateAccessToken();
    const refreshToken = admin.GenerateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokes");
  }
};

const Loginadmin = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if ([email, password].some((item) => item.trim() === "")) {
    throw new ApiError(400, "Name and password is required");
  }
  existingadmin = await Admin.findOne({
    email: email,
  });

  if (!existingadmin) {
    throw new ApiError(400, "Admin doesnt exist in db");
  }

  const isPasswordcorrect=await existingadmin.isPasswordcorrect(password)

  if (!isPasswordcorrect) {
    throw new ApiError(400,"Password is incorrect")
  }
  const {accessToken,refreshToken}=await GenerateAccessandRefreshToken(existingadmin._id)

  const currentloggedinadmin=Admin.findById(existingadmin._id).select(" -password -refreshToken")

  const options={
    httpOnly: true,
    secure: true,
  } 

  return res
  .cookie("accesstoken",accessToken,options)
  .cookie("refreshtoken",refreshToken,options)
  .status(200)
  .json(
    new ApiResponse(200,currentloggedinadmin,accessToken,refreshToken,"Admin logged in success")
  )



});

const Logoutadmin=asyncHandler(async(req,res)=>{
  await Admin.findByIdAndUpdate(
    req.Admin._id,
    {
      $set: {
        refreshToken: undefined,
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
        "Admin logged out successfully!!!!!!!!!!!!!!!!!!!!!"
      )
    );
})
const addscheduler = asyncHandler(async (req, res) => {
  const { type, name, commission, password, email } = req.body;

  console.log("Data gotten is;", type, name, commission, password, email);

  if (
    [type, name, commission, password, email].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(
      400,
      "All fields are required in setting up an scheduler" +
        " of fields type,name,commission,password,email"
    );
  }
  const existingscheduler = Scheduler.findOne({
    $or: [{ name }, { email }],
  });

  if (existingscheduler) {
    throw new ApiError(400, "Scheduler already exists in the table");
  }

  const scheduler=await Scheduler.create({
    type, name, commission, password, email,authorizeremail:req.Admin.email
  })

  const schedulercreated=Scheduler.findById(scheduler._id)

  if (!schedulercreated) {
    throw new ApiError(400,"Scheduler isnt created")
  }

  return res
  .status(200)
  .json(new ApiResponse(200,schedulercreated,"Schduler with password created successfully"))
});
