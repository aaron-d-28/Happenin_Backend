import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/Admin.model.js";
import { Scheduler } from "../models/Scheduler.model.js";

//note this is seen in the admin panel therefore scheduler is set in admin controller
const test=asyncHandler(async(req,res)=>{

  console.log(req)
  res.status(200).json(new ApiResponse(200,{},"Connecction success"))
})

const addadmintest=asyncHandler(async(req,res)=>{
  const{name,password,email}=req.body

  if ([name, password, email].some((item) => item.trim() === "")) {
    throw new ApiError(400, "All fields (name, password, email) are required to add an admin.");
  }
  
  const admin=await Admin.create({

    name:name,
    password,
    email:email
   
  }
  )

  if (!admin) {
    throw new ApiError(400,"Admin couldnt be created ")
  }

  return res
  .status(400)
  .json(new ApiResponse(400,admin,"Admin created successfully"))
})
const GenerateAccessandRefreshToken = async (userId) => {
  try {
    const admin = await Admin.findById(userId);
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }
    const accessToken = admin.GenerateAccessToken();
    const refreshToken = admin.GenerateRefreshToken();
    if (!accessToken || !refreshToken ) {
      throw new ApiError(400,`Access token is:${accessToken} and refresh token is ${refreshToken}`)
    }
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokes");
  }
};

const Loginadmin = asyncHandler(async (req, res) => {
  const { email, password, } = req.body;

  if ([email, password].some((item) => item.trim() === "")) {
    throw new ApiError(400, "Name and password is required");
  }
  const mail=email.toLowerCase()
  // console.log(mail)

  const existingadmin = await Admin.findOne({
    email: mail,
  });

  if (!existingadmin) {
    throw new ApiError(400, "Admin doesnt exist in db");
  }
  // console.log(`Admin is :${existingadmin.name}`)
  
  const isPasswordcorrect=await existingadmin.isPasswordcorrect(password)
  
  if (!isPasswordcorrect) {
    throw new ApiError(400,"Password is incorrect")
  }
  // console.log(`password is correct:${isPasswordcorrect} : For ${existingadmin.name}`)
  
  const {accessToken,refreshToken}=await GenerateAccessandRefreshToken(existingadmin._id)
  
  // console.log(`Access is:${accessToken} refresh is ${refreshToken}`)
  
  
  const currentloggedinadmin=await Admin.findById(existingadmin._id).select("-password -accessToken")

  if (!currentloggedinadmin) {
    throw new ApiError(400,`Admin not found for ${currentloggedinadmin.name} for id ${currentloggedinadmin._id}`)
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
    new ApiResponse(200,{currentloggedinadmin,accessToken,refreshToken},"Admin logged in success")
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
      (field) => field.toString().trim() === "")) {
    throw new ApiError(
      400,
      "All fields are required in setting up an scheduler" +
        " of fields type,name,commission,password,email"
    );
  }
  const existingscheduler =await Scheduler.findOne({
    $or: [{ name:name }, { email:email }],
  });

  if (existingscheduler) {
    console.log(`existing scheduler is:${existingscheduler.name}`)
    throw new ApiError(400, "Scheduler already exists in the table");
  }
  console.log(`Admin is:${req.Admin._id}`)

  const scheduler=await Scheduler.create({
    type, name, commission, password, email,authorizerid:req.Admin._id
  })

  const schedulercreated=await Scheduler.findById(scheduler._id)

  if (!schedulercreated) {
    throw new ApiError(400,"Scheduler isnt created")
  }


  const admin=await Admin.findByIdAndUpdate(
    req.Admin?._id,
    {$push:{
      appointedschedulerid:schedulercreated._id
    }},
  {new: true},
  )

  if (!admin) {
    throw new ApiError(400,"Admin not found")
  }



  return res
  .status(200)
  .json(new ApiResponse(200,schedulercreated,"Schduler with password created successfully"))
});

const getallSheduler=asyncHandler(async(req,res)=>{
  const Schdulers=await Scheduler.aggregate(
    [{
      $match:{authorizerid:req.Admin._id}
    },{
      $project:{
        name:1,
        type:1,
        commission:1,
        email:1
      }
    }]
  )
  return res
  .status(200)
  .json(
    new ApiResponse(200,Schdulers,"Found all schedulers")
  )
  
})
export {
  addscheduler,Loginadmin,Logoutadmin,test,addadmintest,getallSheduler
}