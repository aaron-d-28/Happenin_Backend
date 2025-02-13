import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Employee } from "../models/Mongoose.odm/Employee.model.js";
import {User} from "../models/Mongoose.odm/User.model.js";
import {bookingRecords} from "../models/Drizzle.odm/eventhistory.model.js";
import {Postgresdb} from "../db/drizzle.db.js";
import {and} from "drizzle-orm";
import {eq} from "drizzle-orm/sql/expressions/conditions";
//Simport {use} from "bcrypt/promises.js";
import e from "express";
import {Program} from "../models/Mongoose.odm/Program.model.js";

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

    const { refreshtoken, accesstoken } = await GenerateAccessandRefreshToken(emp._id);

    if (!refreshtoken || !accesstoken) {
        console.log(`Refresh token: ${refreshtoken} and access token: ${accesstoken}`);
        throw new ApiError(400, "Error generating refresh and access token");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    // Rename the variable to avoid conflict with the imported Employee model
    const updatedEmployee = await Employee.findByIdAndUpdate(
        emp._id,
        { $set: { refreshtoken: refreshtoken } },
        { new: true }  // This ensures the updated document is returned
    ).select("-refreshtoken -password");

    res.status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refreshtoken", refreshtoken, options)
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

//note what should happen when an employee adds a user to an event
/*
    1. first get username as its unique and then get the qr text by scanning also get the employee id by cookies
    2. once these values are gotten update value in the table postgres but before check if user is already admitted
    3.then in response say its valid empid date time and isvited
 */
const Admituser=asyncHandler(async (req, res) => {
    const { username,qrval } = req.body;

    const empid=req.employee?._id

    const employeeforevent=await Employee.findById({empid})
    const event=await Program.findById(employeeforevent.eventid);

    if (!employeeforevent) {
        throw new ApiError(400, "Employee not found");
    }
    if (!event)
    {
        throw new ApiError(400, "event  not found");
    }
    if (!(username&&qrval&&empid))
    {
        console.log(`Username:${username} and qrval:${qrval} and empid:${empid} }`);
        throw new ApiError(400, " Username and qrval and empid req");
    }

    const user=await User.findOne({username: username});

    if (!user)
    {
        throw new ApiError(400, "User not found no such user exists");
    }
    let useradmitted;
    try {
        // Find the booking record where:
        // - `customerUserId` matches `username`
        // - `employeeId` matches `empid`
        useradmitted = await Postgresdb
            .select()
            .from(bookingRecords)
            .where(
                and(
                    eq(bookingRecords.customerUserId, username),
                    eq(bookingRecords.employeeId, empid)
                )
            );

        if (useradmitted.isVisited ) {
            throw new ApiError(400, "User already in party");
        }
    } catch (e) {
        console.log(`Error occurred finding user: ${e}`);
        throw new ApiError(500, "Internal Server Error");
    }

    if (qrval!==useradmitted.qrAuth)
    {
        throw new ApiError(400, "Wrong qr auth probably fake");
    }
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const formattedTime = today.toISOString().split("T")[1].split(".")[0] + "+00"; // "HH:MM:SS+00"

    let updatedrecord
        try{
            updatedrecord = await Postgresdb
                .update(bookingRecords) // Specify the table
                .set({
                    date_to_visit: formattedDate,  // Today's date
                    time_visited: formattedTime,   // Current time
                    isVisited: true ,          // Mark as visited
                    employeeId:empid
                }) // Set the new values
                .where(eq(bookingRecords.id, useradmitted.id)) // Filter by ID
                .returning(); // Return the updated record(s)


        }
        catch(err){
        console.log(`Error occurred updatinf record: ${e}`);
        throw new ApiError(500, "cannot update record Error");
        }
        if(event.current_users===NaN)
        {
            event.current_users=1
            event.total_users=1
        }
        else
        {
            event.current_users=event.current_users +1
            event.total_users=event.total_users +1
        }

        return res
            .status(200)
            .json(new ApiResponse(200,updatedrecord ,"Succeess in admitting user"));
})
export { loginemployee ,Admituser};
