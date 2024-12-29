import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { Admin } from "../models/Admin.model.js";
import { Employee } from "../models/Employee.model.js";

const GenerateAccessandRefreshToken=async(id)=>
{
    try {
        const emp=await Employee.findById(id)
        if (!emp) throw new ApiError("Employee not found")

        const refreshtoken=await emp.GenerateRefreshToken()
        const accesstoken=await emp.GenerateAccessToken()

        return {refreshtoken,accesstoken}
    }
            catch (e) {
        console.log(`Error ocured genreating token ${e}`)
                throw new ApiError(500,"Error occurred generating access token")
    }
}
const loginemployee=asyncHandler(async(req,res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        throw  new ApiError(400,"Send email and password");
    }
    const emp=await Employee.findOne({email:email});
    if(!emp){
        throw new ApiError(400,"Employee Not Found");
    }
    const isPasswordCorrect=await emp.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Password is incorrect Not Found");
    }
    const {refresh,access}=await GenerateAccessandRefreshToken(emp._id)

    if(!refresh || !access){
        console.log(`Refresh token: ${refresh} and access token ${access}`);
        throw new ApiError(400,"Error generating refresh and access tokken")
    }
    const options={
        httpOnly: true,
        secure: true,
    }
    const Employee=await Employee.findByIdAndUpdate(emp._id,{
        $set: {refreshtoken:refresh}
    }).select("-refreshtoken -password");

res.status(200)
        .cookie("accesstoken", access, options)
        .cookie("refreshtoken", refresh, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: Employee,
                    accessToken: access,
                    refreshToken: refresh,
                },
                "User logged in successfully"
            )
        );
})





export {loginemployee}
