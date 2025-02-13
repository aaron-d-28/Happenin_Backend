import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Scheduler } from "../models/Mongoose.odm/Scheduler.model.js";
import {uploadonCloudinary} from "../utils/cloudinary.js";
import {Employee} from "../models/Mongoose.odm/Employee.model.js";
import {Postgresdb} from "../db/drizzle.db.js";
import {bookingRecords} from "../models/Drizzle.odm/eventhistory.model.js";
import {User} from "../models/Mongoose.odm/User.model.js";

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
  const {email, password,name,programid} = req.body;


  if (!(email && password && name&& programid)) {
    console.log(email);
    console.log(password);
    console.log(name);
    console.log(programid);
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
  const uploadedurl=await uploadonCloudinary(localimgpath)
  if (!uploadedurl) {
  console.log(`Url uploaded is${uploadedurl}`);
    throw new ApiError(500, "image couldnt be uploaded");
  }

  const Employees=await Employee.create({
    email,
    name,
    password,
    empimg:uploadedurl.url,
    Schedulerid: req.scheduler.id,
    eventid:programid
  })

    console.log("Error occured here in cloud")
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

const getuserdataAge = asyncHandler(async (req, res) => {
  const { eventid } = req.query;
  const startage = Number(req.query.startage ?? 0);
  const endage = Number(req.query.endage ?? 200);

  // Drizzle ORM query to fetch users based on eventId
  const users = await Postgresdb
      .select(bookingRecords.customerUserId)  // Select customerUserId
      .from(bookingRecords)
      .where(bookingRecords.eventId.eq(eventid));  // Filter by eventId

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB part: Filtering users by age (this part remains unchanged)
  const userbyage = (await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: user._id,  // Match the specific user by their _id
          Age: { $gt: startage, $lt: endage }  // Age greater than startAge and less than endAge
        }
      }
    ]);
    return userrow;  // Return the result for each user (which is an array)
  }))).flat();  // Flatten the result to get rid of nested arrays

  if (!userbyage || userbyage.length === 0) {
    console.log(`User by age doesn't exist: ${userbyage}`);
    throw new ApiError(403, "User age doesn't exist");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, userbyage, "Successfully found users by age range"));
});

const getuserdatacity = asyncHandler(async (req, res) => {
  const { cityname, eventid } = req.body;

  if (!cityname || !eventid) {
    console.log(`No cityname given: ${cityname}`);
    throw new ApiError(400, "City name or event ID is missing");
  }

  // Query users from bookingRecords by eventId using Drizzle ORM
  const users = await Postgresdb
      .select(bookingRecords.customerUserId)  // Correct field for selecting customerUserId
      .from(bookingRecords)
      .where(bookingRecords.eventId.eq(eventid));  // Filter by eventId

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB query to filter users based on location_city
  const userbycity = (await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: user.customerUserId,  // Match by customerUserId
          location_city: cityname     // Match by the city name
        }
      }
    ]);

    return userrow;  // Return the result for each user (which is an array)
  }))).flat();  // Flatten the result to get rid of nested arrays

  if (!userbycity || userbycity.length === 0) {
    console.log(`User by city doesn't exist: ${userbycity}`);
    throw new ApiError(403, "No users found for this city");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, userbycity, "Successfully found users by city"));
});

const getUsersByGender = asyncHandler(async (req, res) => {
  const { gender, eventid } = req.body;

  if (!gender || !eventid) {
    throw new ApiError(400, "Gender or event ID is missing");
  }

  // Fetch users based on eventId using Drizzle ORM
  const users = await Postgresdb
      .select(bookingRecords.customerUserId) // Select customerUserId
      .from(bookingRecords)
      .where(bookingRecords.eventId.eq(eventid)); // Filter by eventId

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }


  // MongoDB query: Filter users by gender using aggregate
  const userResults = await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: user.customerUserId, // Use customerUserId to match in MongoDB
          gender: gender             // Filter by gender
        }
      }
    ]);
    return userrow; // Return the result (which is an array)
  }));

  // Flatten the results to eliminate nested arrays
  const usergender = userResults.flat();

  if (!usergender || usergender.length === 0) {
    throw new ApiError(403, `No users found for gender: ${gender}`);
  }

  // Return the filtered users by gender
  return res.status(200).json(new ApiResponse(200, usergender, "Successfully found users by gender"));
});

const getUsersByState = asyncHandler(async (req, res) => {
  const { state, eventid } = req.body; // Assuming state and eventid are sent in the request body

  if (!state || !eventid) {
    throw new ApiError(400, "State or event ID is missing");
  }

  // Fetch users based on eventId using Drizzle ORM
  const users = await Postgresdb
      .select(bookingRecords.customerUserId) // Select only the customerUserId field
      .from(bookingRecords)
      .where(bookingRecords.eventId.eq(eventid)); // Filter by eventId

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB query: Filter users by location_state using aggregate
  const userResults = await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: user.customerUserId,  // Match the specific user by their customerUserId
          location_state: state       // Filter by state
        }
      }
    ]);
    return userrow; // Return the result (which is an array)
  }));

  // Flatten the results to eliminate nested arrays
  const usersByState = userResults.flat(); // Renamed to be more descriptive

  if (!usersByState || usersByState.length === 0) {
    throw new ApiError(403, `No users found for state: ${state}`);
  }

  // Send the response with the filtered users
  return res.status(200).json(new ApiResponse(200, usersByState, "Successfully found users by state"));
});

const getUsersBySuburb = asyncHandler(async (req, res) => {
  const { suburb, eventid } = req.body; // Assuming suburb and eventid are sent in the request body

  if (!suburb || !eventid) {
    throw new ApiError(400, "Suburb or event ID is missing");
  }

  // Fetch users based on eventId using Drizzle ORM
  const users = await Postgresdb
      .select(bookingRecords.customerUserId) // Select only the customerUserId field
      .from(bookingRecords)
      .where(bookingRecords.eventId.eq(eventid)); // Filter by eventId

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB query: Filter users by location_suburb using aggregate
  const userResults = await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: user.customerUserId,  // Match the specific user by their customerUserId
          location_suburb: suburb    // Filter by location_suburb
        }
      }
    ]);
    return userrow; // Return the result (which is an array)
  }));

  // Flatten the results to eliminate nested arrays
  const usersBySuburb = userResults.flat();  // Renamed to be more descriptive

  if (!usersBySuburb || usersBySuburb.length === 0) {
    throw new ApiError(403, `No users found for suburb: ${suburb}`);
  }

  // Send the response with the filtered users
  return res.status(200).json(new ApiResponse(200, usersBySuburb, "Successfully found users by suburb"));
});

export {
  logoutscheduler,
  Loginscheduler,
  registerEmployee,
  getuserdatacity,
  getuserdataAge,
  getUsersByGender,
  getUsersByState,
  getUsersBySuburb
};
