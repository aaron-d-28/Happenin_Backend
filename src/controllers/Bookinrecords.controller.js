import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { bookingRecords } from "../models/Drizzle.odm/eventhistory.model.js";
import {Postgresdb} from "../db/drizzle.db.js";
import {sendEmail} from "../utils/Qr_gen/email.js";
import {User} from "../models/Mongoose.odm/User.model.js";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {Program} from "../models/Mongoose.odm/Program.model.js";

const retriveall= asyncHandler(async (req, res) => {
    const result=await Postgresdb.select().from(bookingRecords)

    if (!result)
    {
        throw new ApiError(400,"Error fetching result")
    }
    return res.status(200)
        .json(new ApiResponse(200,result,"Succeess is fetching"))

})

const addrecord = asyncHandler(async (req, res) => {
    // Destructuring request body
    const { eventId, employeeId, customerUserId, date_to_visit } = req.body;

    // Ensure all required fields are present
    if (!eventId || !customerUserId || !date_to_visit) {
        throw new ApiError(400, "Error: Required fields are missing");
    }

    // Fetch event and user
    const usergot = await User.findById(customerUserId);
    const eventgot = await Program.findById(eventId);

    // Check if event and user exist
    if (!eventgot || !usergot) {
        throw new ApiError(400, "Error fetching event or user");
    } else {
        console.log(`Event id: ${eventgot._id}, User id: ${usergot.email}`);
    }

    // Generate encrypted secret and send email with QR code
    const encryptedsecret = await sendEmail(usergot.email, eventgot.programname, date_to_visit, usergot.fullname);

    // If no encryptedsecret returned, handle error
    if (!encryptedsecret) {
        throw new ApiError(400, "Error: Encrypted secret couldn't be generated, no email sent");
    }

    console.log("Here it's working rahhhhhh");

    // Get current date and time
    const todaydate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todaytime = new Date().toISOString().split('T')[1]; // HH:mm:ss.SSSZ

    if (!todaydate || !todaytime) {
        console.log("Can't produce date and time");
        throw new ApiError(400, "Error: Unable to generate current date and time");
    } else {
        console.log(`Date: ${todaydate}, Time: ${todaytime}`);
    }

    // Create a new booking record using Drizzle ORM
    let newRecord;
    try {
        newRecord = await Postgresdb.insert(bookingRecords)
            .values({
                eventId,
                employeeId: employeeId || null, // Optional
                customerUserId,
                date_booked: todaydate,  // Get only the date part (YYYY-MM-DD)
                time_booked: todaytime,  // Get current time (HH:mm:ss.SSSZ)
                date_to_visit: date_to_visit,  // Date to visit (provided)
                time_visited: null,  // Set to null if not provided
                isVisited: false,  // Default to false if not provided
                qrAuth: encryptedsecret || null  // Fallback to null if qrAuth is not provided
            })
            .returning();

        if (!newRecord || newRecord.length === 0) {
            throw new ApiError(400, "Error: Failed to create a new record");
        }

        console.log("Booking record created successfully!!!!!!!!:");

    } catch (e) {
        console.log(`Error creating booking record: ${e}`);
        throw new ApiError(400, `Error creating booking record: ${e.message}`);
    }

    // Return the new record as a response
    return res.status(200).json(
        new ApiResponse(200, newRecord[0], "Success: Record inserted successfully")
    );
});


export  {
    retriveall,addrecord,
}