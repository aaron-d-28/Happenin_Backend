import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Scheduler } from "../models/Mongoose.odm/Scheduler.model.js";
import {uploadonCloudinary} from "../utils/cloudinary.js";
import {Employee} from "../models/Mongoose.odm/Employee.model.js";
import {Postgresdb} from "../db/drizzle.db.js";
import {bookingRecords} from "../models/Drizzle.odm/eventhistory.model.js";
import {User} from "../models/Mongoose.odm/User.model.js";
import exceljs from "exceljs";

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

const sendexcel= (data,nameofdata) => {
let workbook=new exceljs.Workbook();
let worksheet=workbook.addWorksheet(nameofdata)
  let columns = data.length > 0 ? Object.keys(data[0]) : [];

  worksheet.columns = columns.map((el) => ({
    header: camelCase(el),
    key: el,
    width: 20
  }));

  worksheet.addRows(data);

  return workbook;
}
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
import { eq } from "drizzle-orm";
import mongoose from "mongoose";
import {camelCase} from "change-case/keys"; // Import eq for filtering

const getuserdataAge = asyncHandler(async (req, res) => {
  const {eventid} = req.body ;
  const startage = Number(req.query.startage ?? 0);
  const endage = Number(req.query.endage ?? 200);

  if (!eventid)
  {
    console.log(eventid);
    throw new ApiError(400, "Event id is impt");
  }
  // Drizzle ORM query to fetch users based on eventId
  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })  // Corrected select syntax
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));  // Correct Drizzle filter

  if (!users || users.length === 0) {
    throw new ApiError(400, `No users found for this program called:${eventid}`);
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }
  // console.log(`Here are the ${JSON.stringify(users)} users`);
  // MongoDB part remains unchanged
  const userbyage = (await Promise.all(users.map(async (user) => {
    console.log(`The user is :${JSON.stringify(user)}`);
    const userrow = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user.customerUserId),
          Age: { $gt: startage, $lt: endage }
        }
      }
    ]);
    return userrow;
  }))).flat();

  if (!userbyage || userbyage.length === 0) {
    throw new ApiError(403, "User age doesn't exist");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, userbyage, "Successfully found users by age range"));
});

const getuserdatacity = asyncHandler(async (req, res) =>  {
    const { cityname, eventid } = req.body;

  if (!(cityname && eventid)) {
    throw new ApiError(400, "City name or event ID is missing");
  }

  // Drizzle ORM Query
  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB Query
  const userbycity = (await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user.customerUserId),  // ✅ Fixed ObjectId conversion
          location_city: cityname
        }
      }
    ]);
    return userrow;
  }))).flat();

  if (!userbycity || userbycity.length === 0) {
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

  // Drizzle ORM Query
  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB Query
  const userResults = await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user.customerUserId),  // ✅ Fixed ObjectId conversion
          gender: gender
        }
      }
    ]);
    return userrow;
  }));

  const usergender = userResults.flat();

  if (!usergender || usergender.length === 0) {
    throw new ApiError(403, `No users found for gender: ${gender}`);
  }

  return res.status(200).json(new ApiResponse(200, usergender, "Successfully found users by gender"));
});

const getUsersByState = asyncHandler(async (req, res) => {
  const { state, eventid } = req.body;

  if (!state || !eventid) {
    throw new ApiError(400, "State or event ID is missing");
  }

  // Drizzle ORM Query
  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB Query
  const userResults = await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user.customerUserId),  // ✅ Fixed ObjectId conversion
          location_state: state
        }
      }
    ]);
    return userrow;
  }));

  const usersByState = userResults.flat();

  if (!usersByState || usersByState.length === 0) {
    throw new ApiError(403, `No users found for state: ${state}`);
  }

  return res.status(200).json(new ApiResponse(200, usersByState, "Successfully found users by state"));
});

const getUsersBySuburb = asyncHandler(async (req, res) => {
  const { suburb, eventid } = req.body;

  if (!suburb || !eventid) {
    throw new ApiError(400, "Suburb or event ID is missing");
  }

  // Drizzle ORM Query
  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB Query
  const userResults = await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user.customerUserId),  // ✅ Fixed ObjectId conversion
          location_suburb: suburb
        }
      }
    ]);
    return userrow;
  }));

  const usersBySuburb = userResults.flat();

  if (!usersBySuburb || usersBySuburb.length === 0) {
    throw new ApiError(403, `No users found for suburb: ${suburb}`);
  }

  return res.status(200).json(new ApiResponse(200, usersBySuburb, "Successfully found users by suburb"));
});


const getuserdatacityxl = asyncHandler(async (req, res) =>  {
  const { cityname, eventid } = req.body;

  if (!(cityname && eventid)) {
    throw new ApiError(400, "City name or event ID is missing");
  }

  // Drizzle ORM Query
  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users || users.length === 0) {
    throw new ApiError(400, "No users found for this program");
  }

  if (!Array.isArray(users)) {
    throw new Error("Users must be an array");
  }

  // MongoDB Query
  const userbycity = (await Promise.all(users.map(async (user) => {
    const userrow = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(user.customerUserId),  // ✅ Fixed ObjectId conversion
          location_city: cityname
        }
      },
      {
        $project: {
          refreshToken: 0  // Excludes the "refreshToken" field
        }
      }
    ]);
    return userrow;
  }))).flat();

  if (!userbycity || userbycity.length === 0) {
    throw new ApiError(403, "No users found for this city");
  }const excelBook = sendexcel(userbycity, "Citydata");

  const buffer = await excelBook.xlsx.writeBuffer(); // Convert workbook to buffer

  res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", 'attachment; filename="CityData.xlsx"');

  res.status(200).send(Buffer.from(buffer)); // Send buffer as response

});

const getUserDataByAgeXL = asyncHandler(async (req, res) => {
  const { eventid } = req.body;
  const startage = Number(req.query.startage ?? 0);
  const endage = Number(req.query.endage ?? 200);

  if (!eventid) throw new ApiError(400, "Event ID is required");

  // Fetch users from PostgreSQL
  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users.length) throw new ApiError(400, "No users found");

  // Fetch user details from MongoDB
  const userData = (await Promise.all(users.map(async (user) => {
    return await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(user.customerUserId), Age: { $gt: startage, $lt: endage } } },
      { $project: { refreshToken: 0 } }
    ]);
  }))).flat();

  if (!userData.length) throw new ApiError(403, "No users found in age range");

  // Generate Excel
  const workbook = sendexcel(userData, "UsersByAge");
  const buffer = await workbook.xlsx.writeBuffer();

  // Send as attachment
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="UsersByAge.xlsx"');
  res.status(200).send(Buffer.from(buffer));
});

const getUserDataByGenderXL = asyncHandler(async (req, res) => {
  const { gender, eventid } = req.body;
  if (!gender || !eventid) throw new ApiError(400, "Gender or event ID is required");

  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users.length) throw new ApiError(400, "No users found");

  const userData = (await Promise.all(users.map(async (user) => {
    return await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(user.customerUserId), gender } },
      { $project: { refreshToken: 0 } }
    ]);
  }))).flat();

  if (!userData.length) throw new ApiError(403, `No users found for gender: ${gender}`);

  const workbook = sendexcel(userData, "UsersByGender");
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="UsersByGender.xlsx"');
  res.status(200).send(Buffer.from(buffer));
});

const getUserDataByStateXL = asyncHandler(async (req, res) => {
  const { state, eventid } = req.body;
  if (!state || !eventid) throw new ApiError(400, "State or event ID is required");

  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users.length) throw new ApiError(400, "No users found");

  const userData = (await Promise.all(users.map(async (user) => {
    return await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(user.customerUserId), location_state: state } },
      { $project: { refreshToken: 0 } }
    ]);
  }))).flat();

  if (!userData.length) throw new ApiError(403, `No users found for state: ${state}`);

  const workbook = sendexcel(userData, "UsersByState");
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="UsersByState.xlsx"');
  res.status(200).send(Buffer.from(buffer));
});

const getUserDataBySuburbXL = asyncHandler(async (req, res) => {
  const { suburb, eventid } = req.body;
  if (!suburb || !eventid) throw new ApiError(400, "Suburb or event ID is required");

  const users = await Postgresdb
      .select({ customerUserId: bookingRecords.customerUserId })
      .from(bookingRecords)
      .where(eq(bookingRecords.eventId, eventid));

  if (!users.length) throw new ApiError(400, "No users found");

  const userData = (await Promise.all(users.map(async (user) => {
    return await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(user.customerUserId), location_suburb: suburb } },
      { $project: { refreshToken: 0 } }
    ]);
  }))).flat();

  if (!userData.length) throw new ApiError(403, `No users found for suburb: ${suburb}`);

  const workbook = sendexcel(userData, "UsersBySuburb");
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="UsersBySuburb.xlsx"');
  res.status(200).send(Buffer.from(buffer));
});

export {
  logoutscheduler,
  Loginscheduler,
  registerEmployee,
  getuserdatacity,
  getuserdataAge,
  getUsersByGender,
  getUsersByState,
  getUsersBySuburb,
    getuserdatacityxl,
    getUserDataBySuburbXL,
    getUserDataByStateXL,
    getUserDataByGenderXL,
    getUserDataByAgeXL
};
