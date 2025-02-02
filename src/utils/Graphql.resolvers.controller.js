import { Program } from "../models/Mongoose.odm/Program.model.js";
import { ApiError } from "./ApiError.js";
import { User } from "../models/Mongoose.odm/User.model.js";
import { Scheduler } from "../models/Mongoose.odm/Scheduler.model.js";
import { Employee } from "../models/Mongoose.odm/Employee.model.js";
import { ApiResponse } from "./ApiResponse.js";

const fetchPrograms = async (filter, errorMessage) => {
    try {
        const programs = await Program.find(filter);
        if (programs.length === 0) {
            return new ApiResponse(200, [], "No programs found");
        }
        return new ApiResponse(200, programs, "Programs fetched successfully");
    } catch (error) {
        console.error(errorMessage, error);
        return new ApiResponse(400, [], "Error fetching programs");
    }
};

export const resolvers = {
    Query: {
        getPrograms: () => fetchPrograms({}, "Failed to fetch programs"),
        getUsers: async () => {
            try {
                const users = await User.find();
                if (users.length === 0) {
                    return new ApiResponse(200, [], "No users found");
                }
                return new ApiResponse(200, users, "Users fetched successfully");
            } catch (errorMessage) {
                console.error(errorMessage);
                return new ApiResponse(400, [], "Error fetching users");
            }
        },
        getSchedulers: async () => {
            try {
                const schedulers = await Scheduler.find();
                if (schedulers.length === 0) {
                    return new ApiResponse(200, [], "No schedulers found");
                }
                return new ApiResponse(200, schedulers, "Schedulers fetched successfully");
            } catch (errorMessage) {
                console.error(errorMessage);
                return new ApiResponse(400, [], "Error fetching schedulers");
            }
        },
        getEmployees: async () => {
            try {
                const employees = await Employee.find();
                if (employees.length === 0) {
                    return new ApiResponse(200, [], "No employees found");
                }
                return new ApiResponse(200, employees, "Employees fetched successfully");
            } catch (errorMessage) {
                console.error(errorMessage);
                return new ApiResponse(400, [], "Error fetching employees");
            }
        },
        getAdmins: async () => {
            try {
                const admins = await User.find();
                if (admins.length === 0) {
                    return new ApiResponse(200, [], "No admins found");
                }
                return new ApiResponse(200, admins, "Admins fetched successfully");
            } catch (errorMessage) {
                console.error(errorMessage);
                return new ApiResponse(400, [], "Error fetching admins");
            }
        },

        getProgramtype: async (_, { type }) => {
            try {
                const program = await Program.find({ type: type });
                if (program.length === 0) {
                    return new ApiResponse(200, [], "No program found for the given type");
                }
                return new ApiResponse(200, program, "Program type fetched successfully");
            } catch (error) {
                console.error("Error fetching program by type:", error);
                return new ApiResponse(400, [], "Error fetching program by type");
            }
        },
        getProgramsuburb: async (_, { suburb }) => {
            try {
                const programbysuburb = await Program.find({ location_suburb: suburb });
                if (programbysuburb.length === 0) {
                    return new ApiResponse(200, [], "No programs found for the given suburb");
                }
                return new ApiResponse(200, programbysuburb, "Program by suburb fetched successfully");
            } catch (error) {
                return new ApiResponse(400, [], "Error fetching program by suburb");
            }
        },
        getProgramstate: async (_, { state }) => {
            try {
                const programstate = await Program.find({ location_state: state });
                if (programstate.length === 0) {
                    return new ApiResponse(200, [], "No programs found for the given state");
                }
                return new ApiResponse(200, programstate, "Program by state fetched successfully");
            } catch (error) {
                return new ApiResponse(400, [], "Error fetching program by state");
            }
        },
        getProgramprice: async (_, { price }) => {
            try {
                const programprice = await Program.find({ price: { $lt: price } });
                if (programprice.length === 0) {
                    return new ApiResponse(200, [], "No programs found with the specified price range");
                }
                return new ApiResponse(200, programprice, "Program by price fetched successfully");
            } catch (error) {
                return new ApiResponse(400, [], "Error fetching program by price");
            }
        },
        getProgramcity: async (_, { city }) => {
            try {
                const program = await Program.find({ location_city: city });
                if (program.length === 0) {
                    return new ApiResponse(200, [], "No programs found for the given city");
                }
                return new ApiResponse(200, program, "Program by city fetched successfully");
            } catch (e) {
                return new ApiResponse(400, [], `Error fetching program by city: ${e}`);
            }
        },
        getProgrambyScheduler: async (_, { schedulerid }) => {
            try {
                const program = await Program.find({ programAuthorizerid: schedulerid });
                if (program.length === 0) {
                    return new ApiResponse(200, [], `No programs found for scheduler ID: ${schedulerid}`);
                }
                return new ApiResponse(200, program, "Program by scheduler fetched successfully");
            } catch (e) {
                console.log(`Error fetching program by scheduler ID: ${e}`);
                return new ApiResponse(400, [], "Error fetching program by scheduler");
            }
        },

        getUserbycity: async (_, { location_city }) => {
            try {
                const user = await User.find({ location_city: location_city });
                if (user.length === 0) {
                    return new ApiResponse(200, [], "No users found for the given city");
                }
                return new ApiResponse(200, user, "User by city fetched successfully");
            } catch (e) {
                return new ApiResponse(400, [], `Error fetching users by city: ${e.message}`);
            }
        },
        getUserbysuburb: async (_, { location_suburb }) => {
            try {
                const users = await User.find();

                // Ensure an empty array is returned if no users are found
                return users.length > 0 ? users : [];
            } catch (e) {
                console.error("Error fetching users by suburb:", e);
                throw new ApiError(400, `Error fetching users by suburb: ${e.message}`);
            }
        },
        getUserbystate: async (_, { location_state }) => {
            try {
                const userstate = await User.find({ location_state: location_state });
                if (userstate.length === 0) {
                    return new ApiResponse(200, [], "No users found for the given state");
                }
                return new ApiResponse(200, userstate, "User by state fetched successfully");
            } catch (e) {
                console.log(`Error fetching users by state: ${e}`);
                return new ApiResponse(400, [], `Error fetching users by state: ${e}`);
            }
        },
        getUserbyDOBmorethan: async (_, { Age }) => {
            try {
                const user = await User.aggregate([
                    {
                        $project: {
                            name: 1,
                            DOB: 1,
                            age: {
                                $floor: {
                                    $divide: [
                                        { $subtract: [new Date(), "$DOB"] },
                                        1000 * 60 * 60 * 24 * 365.25
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            age: { $gt: Age }
                        }
                    },
                    {
                        $group: {
                            _id: "$age",
                            users: { $push: "$$ROOT" }
                        }
                    },
                    {
                        $project: {
                            age: "$_id",
                            users: 1,
                            _id: 0
                        }
                    }
                ]);
                if (user.length === 0) {
                    return new ApiResponse(200, [], "No users found older than the specified age");
                }
                return new ApiResponse(200, user, "Users older than the specified age fetched successfully");
            } catch (e) {
                console.log(`Error fetching users by age: ${e}`);
                return new ApiResponse(400, [], `Error fetching users by age: ${e}`);
            }
        },
        getUserbyDOBlessthan: async (_, { Age }) => {
            try {
                const user = await User.aggregate([
                    {
                        $project: {
                            name: 1,
                            DOB: 1,
                            age: {
                                $floor: {
                                    $divide: [
                                        { $subtract: [new Date(), "$DOB"] },
                                        1000 * 60 * 60 * 24 * 365.25
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            age: { $lt: Age }
                        }
                    },
                    {
                        $group: {
                            _id: "$age",
                            users: { $push: "$$ROOT" }
                        }
                    },
                    {
                        $project: {
                            age: "$_id",
                            users: 1,
                            _id: 0
                        }
                    }
                ]);
                if (user.length === 0) {
                    return new ApiResponse(200, [], "No users found younger than the specified age");
                }
                return new ApiResponse(200, user, "Users younger than the specified age fetched successfully");
            } catch (e) {
                console.log(`Error fetching users by age: ${e}`);
                return new ApiResponse(400, [], `Error fetching users by age: ${e}`);
            }
        },
        getUserByAgeRange: async (_, { minAge, maxAge }) => {
            try {
                const users = await User.aggregate([
                    {
                        $project: {
                            name: 1,
                            DOB: 1,
                            age: {
                                $floor: {
                                    $divide: [
                                        { $subtract: [new Date(), "$DOB"] }, // Current date - DOB
                                        1000 * 60 * 60 * 24 * 365.25        // Convert milliseconds to years
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            age: { $gte: minAge, $lte: maxAge } // Match users with age between minAge and maxAge
                        }
                    },
                    {
                        $group: {
                            _id: "$age",  // Group by the calculated age
                            users: { $push: "$$ROOT" } // Collect all users in the same age group
                        }
                    },
                    {
                        $project: {
                            age: "$_id",  // Rename _id to age
                            users: 1,
                            _id: 0
                        }
                    }
                ]);
                if (users.length === 0) {
                    return new ApiResponse(200, [], `No users found between ${minAge} and ${maxAge} years old`);
                }
                return new ApiResponse(200, users, `Users between ${minAge} and ${maxAge} years old fetched successfully`);
            } catch (e) {
                console.log(`Error fetching users by age range: ${e}`);
                return new ApiResponse(400, [], `Error fetching users by age range: ${e}`);
            }
        },

        //note done below
        getEmployeesByScheduler: async (_, { schedulerid }) => {
            try {
                const employees = await Employee.find({ Schedulerid: { $in: [schedulerid] } });
                if (employees.length === 0) {
                    return new ApiResponse(200, [], "No employees found for the given scheduler ID");
                }
                return new ApiResponse(200, employees, "Employees retrieved successfully");
            } catch (e) {
                console.log(`Error occurred while fetching employees by scheduler id: ${e}`);
                return new ApiResponse(400, [], "Error occurred while fetching employees");
            }
        },
        //note done below
        getSchedulerbyProgram:async (_, { programid }) => {
            try {
                const Scheduler=await Scheduler.find({programid:{ $in: [programid] }})
                if (Scheduler.length === 0) {
                    return new ApiResponse(200,{},"no Scheduler found for such program")
                }
                return new ApiResponse(200, Scheduler, "Scheduler retrieved successfully");
            }
            catch (e) {
                console.log(`Error occurred while getSchedulerbyProgram:${e}`);
                throw new ApiError(400,`Error occured while trying to retirieve ${e}`)
            }
        },
        //note done below
        getAdminbyScheduler:async (_, { schedulerid }) => {
            try {
                const Admin=await Admin.find({appointedschedulerid:{ $in: [schedulerid] }})
                if (Admin.length === 0) {
                    return new ApiResponse(200, [], "No employees found for the given Admin ID");
                }
                return new ApiResponse(200, Admin, "Admin retrieved successfully");
            }
            catch (e) {
                console.log(`Error occurred while getAdminbyScheduler:${e}`);
                throw new ApiError(400,`Error occurred while getAdminbyScheduler:${e}`);
            }
        },

        //note done below
        getSchedulersbyAdmin:async (_, { Adminid }) => {
            try {
                const scheduler=await Scheduler.find({authorizerid: { $in: [Adminid] }})
                if (scheduler.length === 0) {
                    return new ApiResponse(200, [], "No Scheduler found for the given Admin ID");
                }
                return new ApiResponse(200, scheduler, "Scheduler retrieved successfully");
            }
             catch (e) {
                console.log(`Error occurred while getSchedulersbyAdmin:${e}`);
                throw new ApiError(400,"Error while trying to fetch schedulers by admin")
             }

        },

        getSchedulersbyEmployee:async(_,{Employeeid}) => {
            try {
                const Scheduler=await Scheduler.find({employeeid:{ $in: [Employeeid] }})
                if(Scheduler.length === 0) {
                    return new ApiResponse(200,{},"No Scheduler found for the given Employee");
                }
                return  new ApiResponse(200,Scheduler, "Scheduler retrieved successfully");
            }
            catch (e) {
                console.log(`Error occurred while getSchedulersbyEmployee:${e}`);
                throw new ApiError(400,"Error while getSchedulersbyEmployee:${e}`);")
            }
        },
    }
};
