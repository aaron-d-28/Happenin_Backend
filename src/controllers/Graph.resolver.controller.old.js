import {Program} from "../models/Program.model.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.model.js";
import {Scheduler} from "../models/Scheduler.model.js";
import {Employee} from "../models/Employee.model.js";

const fetchPrograms = async (filter, errorMessage) => {
    try {
        return await Program.find(filter);
    } catch (error) {
        console.error(errorMessage, error);
        throw new ApiError(400, errorMessage);
    }
};

export const resolvers = {
    Query: {
        getPrograms: () => fetchPrograms({}, "Failed to fetch programs"),
        getUsers: async () => {
            try {
                return await User.find();
            } catch (errorMessage) {
                console.error(errorMessage);
                throw new ApiError(400, errorMessage);
            }
        },
        getSchedulers: async () => {
            try {
                return await Scheduler.find();
            } catch (errorMessage) {
                console.error(errorMessage);
                throw new ApiError(400, errorMessage);
            }
        },
        getEmployees: async () => {
            try {
                return await Employee.find();
            } catch (errorMessage) {
                console.error(errorMessage);
                throw new ApiError(400, errorMessage);
            }
        },
        getAdmins: async () => {
            try {
                return await User.find();
            } catch (errorMessage) {
                console.error(errorMessage);
                throw new ApiError(400, errorMessage);
            }
        },

        getProgramtype: async (_, {type}) => {
            try {
                const program = await Program.find({type: type});
                if (!program) throw new ApiError(404, "Programtype not found");
                return program;
            } catch (error) {
                console.error("Error fetching program by ID:", error);
                throw new ApiError(400, "Failed to fetch program by type");
            }
        },
        getProgramsuburb: async (_, {suburb}) => {
            const programbysuburb = await Program.find({location_suburb: suburb})
            if (!programbysuburb) throw new ApiError(404, "Programsuburb not found");
            return programbysuburb
        },
        getProgramstate: async (_, {state}) => {
            const programstate = await Program.find({location_state: state});
            if (!programstate) throw new ApiError(404, "Programstatenot found");
            return programstate;
        },
        getProgramprice: async (_, {price}) => {
            const programprice = await Program.find({price: {$lt: price}});
            if (!programprice) throw new ApiError(404, "Programwith less price not found");
            return programprice;
        },
        getProgramcity: async (_, {city}) => {
            try {
                const program=await Program.find({location_city: city});
                if (!program) throw new ApiError(404, "No city  found with this Program");
                return program;
            }
            catch (e) {
                throw new ApiError(400, `Error found while trying to find program city:${e}`);
            }
        },
        getProgrambyScheduler: async (_,{schedulerid})=>{
            try {
                const program = await Program.find({programAuthorizerid: schedulerid});
                if (!program) throw new ApiError(404, `Program not found created by ${schedulerid}`);
                return program;
            }
            catch (e) {
                console.log(`Error found:${e}`)
                throw new ApiError(400, `Error found while trying to find program scheduler:${e}`);
            }
        },

        getUserbycity:async (_, {location_city}) => {
            try {
                const user=await User.find({location_city: location_city});
                if (!user) throw new ApiError(404, "User not found by location_city");
                return user;
            }
            catch (e) {
                throw new ApiError(400, `Error occured while fetching by city for users${e.message}`);
            }
        },
        getUserbysuburb:async (_, {location_suburb}) => {
            try {
                const userbysuburb=await User.find({location_suburb: location_suburb});
                if (!userbysuburb) throw new ApiError(404, "User not found by location_suburb");
            }
            catch (e) {
                console.log("Error in fetching userbysuburb")
                throw new ApiError(400,`Error in fetching by user suburb:${e}`)
            }
        },
        getUserbystate:async (_, {location_state}) => {
            try {
                const userstate = await User.find({location_state: location_state});
                if (!userstate) throw new ApiError(404, "User not found by location_state");
                return userstate;
            }
            catch (e) {
                console.log(`Error in fetching userbystate:${e}`);
                throw new ApiError(400, `Error in fetching userbystate:${e}`);
            }
        },
        getUserbyDOBmorethan:async (_,{DOB})=>{
            try {
                const user=await User.aggregate([
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
                            age: { $gt: 25 }  // Only include users with age greater than 25
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
                ])
                if (!user) throw new ApiError(404, "User more than that age not found");
                return user;
            }
            catch (e) {
                console.log(`Error in fetching userbysage:${e}`);
                throw new ApiError(400, `Error in fetching userbysAge:${e}`);
            }
        },
        getUserbyDOBlessthan:async (_,{DOB})=>{
            try {
                const user=await User.aggregate([
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
                            age: { $lt: 25 }  // Only include users with age greater than 25
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
                ])
                if (!user) throw new ApiError(404, "User less than that age not found");
                return user;
            }
            catch (e) {
                console.log(`Error in fetching userbysage:${e}`);
                throw new ApiError(400, `Error in fetching userbysAge:${e}`);
            }
        },

        getEmployeesidbyScheduler:async (_, {schedulerid}) => {
            try {
                const Employees=await Employee.find({Schedulerid:schedulerid});
                if (!Employees) throw new ApiError(404, "Employees dont exist");
                return Employees;
            }
            catch (e) {
                console.log(`Error found by searching for employees ny scheduler id:${e}`)
                throw new ApiError(400, `Error in fetching employees:${e}`);
            }
        }



    },
};


// todo here start from line 102
//means here u need to start implementation of all these functions
//note while making queries user fragments and optional rendering that is impt
/*
todo so here we have to follow these steps
const buildQuery = (includeAuthor) => gql`
  query GetUserPosts($userId: ID!) {
    user(id: $userId) {
      posts {
        id
        title
        ${includeAuthor ? "author { name email }" : ""}
      }
    }
  };
// Usage
const includeAuthor = true; // or false, based on user input or app logic
const GET_USER_POSTS = buildQuery(includeAuthor);
const { loading, error, data } = useQuery(GET_USER_POSTS, {
  variables: { userId: "123" },
});


 */