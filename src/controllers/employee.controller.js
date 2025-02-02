import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/Mongoose.odm/Employee.model.js";

const GenerateAccessandRefreshToken = async (id) => {
    try {
        const emp = await Employee.findById(id);
        if (!emp) throw new ApiError("Employee not found");

        const refreshtoken = await emp.GenerateRefreshToken();
        const accesstoken = await emp.GenerateAccessToken();

        return { refreshtoken, accesstoken };
    } catch (e) {
        console.log(`Error occurred generating token ${e}`);
        throw new ApiError(500, "Error occurred generating access token");
    }
};

const loginemployee = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Send email and password");
    }

    const emp = await Employee.findOne({ email: email });
    if (!emp) {
        throw new ApiError(400, "Employee Not Found");
    }

    const isPasswordCorrect = await emp.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is incorrect");
    }

    const { refresh, access } = await GenerateAccessandRefreshToken(emp._id);

    if (!refresh || !access) {
        console.log(`Refresh token: ${refresh} and access token: ${access}`);
        throw new ApiError(400, "Error generating refresh and access token");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    // Rename the variable to avoid conflict with the imported Employee model
    const updatedEmployee = await Employee.findByIdAndUpdate(
        emp._id,
        { $set: { refreshtoken: refresh } },
        { new: true }  // This ensures the updated document is returned
    ).select("-refreshtoken -password");

    res.status(200)
        .cookie("accesstoken", access, options)
        .cookie("refreshtoken", refresh, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: updatedEmployee,
                    accessToken: access,
                    refreshToken: refresh,
                },
                "User logged in successfully"
            )
        );
});

export { loginemployee };
