import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/Mongoose.odm/User.model.js";
import {upload} from "../middlewares/multer.middleware.js";
import {uploadonCloudinary} from "../utils/cloudinary.js";
import {Admin} from "../models/Mongoose.odm/Admin.model.js";
import {calculateAge} from "../utils/Qr_gen/Calculateage.js";

//steps when writing the insert booking remember to enter  +530 for everytime inserted query because it is witout time zone
// steps rather just use a js library for that time stuff
const GenerateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.GenerateAccessToken();
        const refreshToken = user.GenerateRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Failed to generate tokens");
        }

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // console.log(`Refresh token: ${refreshToken} and Access Token: ${accessToken}`);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in GenerateAccessandRefreshToken:", error);
        throw new ApiError(500, `Something went wrong while generating tokens: ${error.message}`);
    }
};

 const registeruser = asyncHandler(async (req, res) => {
    const {
        username,
        password,
        fullname,
        email,
        phone,
        location_suburb,
        location_city,
        location_state,
        pincode,gender,
        DOB
    } = req.body;

    // Check for empty, undefined, or null values
    if (
        [username, password, fullname, email,gender, phone, location_suburb, location_city, location_state, pincode, DOB]
            .some((item) => item === undefined || item === null || (typeof item === 'string' && item.trim() === ""))
    ) {
        console.log({
            username,
            password,
            fullname,
            email,
            phone,
            location_suburb,
            location_city,
            location_state,
            pincode,
            DOB,
            gender
        });

        throw new ApiError(400, "All fields are required");
    }
    const useralready = await User.findOne({username:username});
    if (useralready) {
        console.log(`User already exists`);
        throw new ApiError(400, "User already exists");
    }
    // Handling image upload
    let imageurl = "";
    let usrimgupload = "";
    if (req.file?.userimage) {
        usrimgupload = req.file?.userimage?.path;
        console.log(`Image local path is ${usrimgupload}`);
        if (!usrimgupload) {
            throw new ApiError(400, "Error has occured in the code");
        }
        try {
            imageurl = await uploadonCloudinary(usrimgupload);
        } catch (error) {
            console.log(`Error found: ${error}`);
        }
        if (!imageurl) {
            throw new ApiError(400, `${imageurl} URL of image not found`);
        }
        console.log(`Image is uploaded online at url: ${imageurl}`);
    }
    // Ensure DOB is a valid date
    let dobParsed = new Date(DOB);
    if (isNaN(dobParsed)) {
        throw new ApiError(400, "Invalid Date of Birth");
    }

    // Create user
    const user = await User.create({
        username,
        password,
        fullname,
        email,
        phone,
        location_suburb,
        location_city,
        location_state,
        pincode,
        userimage: imageurl.url || "",
        DOB: dobParsed,
        gender:gender
    });

    // Find and return created user without password
    const userfound = await User.findById(user._id).select("-password");

    if (!userfound) {
        throw new ApiError(500, "Error: User not created");
    }

    return res.status(200)
        .json(new ApiResponse(200, userfound, "User created successfully yayy!!"));
});

 const loginuser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    const userfound = await User.findOne({email: email})
    if (!userfound) {
        throw new ApiError(400, "Error user not found")
    }
    const passwordiscorrect = await userfound.isPasswordCorrect(password)
    if (passwordiscorrect) {
        throw new ApiError(400, "Error user password is incorrect")
    }
    const {accessToken, refreshToken} = await GenerateAccessandRefreshToken(userfound._id)
    if (!accessToken || !refreshToken) {
        console.log(`Access token is${accessToken} and Refresh token is ${refreshToken}`);
        throw new ApiError(400, "Error in creation of tokens")
    }
    const currentloggedinuser = await User.findById(userfound._id).select("-password")
    if (!currentloggedinuser) {
        throw new ApiError(400, "Error in creation of user")
    }


     const calAge = calculateAge(currentloggedinuser.DOB);
     console.log(`Age of the user is: ${calAge}`);

    console.log("Working")
// Check if the calculated age is valid
     if (isNaN(calAge) || calAge < 0) {
         throw new ApiError(400, "Error in calculation of user age");
     }

// Find the user by ID and update the Age field
     const updatedUser = await User.findById(currentloggedinuser._id);
     updatedUser.Age = calAge;  // Set the calculated age
     await updatedUser.save();   // Save the updated user document

     console.log('User age updated successfully');



    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .cookie("accesstoken", accessToken, options)
        .cookie("refreshtoken", refreshToken, options)
        .status(200)
        .json(
            new ApiResponse(200, {currentloggedinuser, accessToken, refreshToken}, "user logged in successful")
        )


})
export {loginuser,registeruser}