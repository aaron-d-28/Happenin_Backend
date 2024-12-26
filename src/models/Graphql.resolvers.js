import {Program} from "./Program.model.js";
import {ApiError} from "../utils/ApiError.js";

const fetchPrograms = async (filter, errorMessage) => {
    try {
        return await Program.find(filter);
    } catch (error) {
        console.error(errorMessage, error);
        throw new ApiError(400, errorMessage);
    }
};

export  const resolvers = {
    Query: {
        getPrograms: () => fetchPrograms({}, "Failed to fetch programs"),
        getProgramid: async (_, { id }) => {
            try {
                const program = await Program.findById(id);
                if (!program) throw new ApiError(404, "Program not found");
                return program;
            } catch (error) {
                console.error("Error fetching program by ID:", error);
                throw new ApiError(400, "Failed to fetch program by ID");
            }
        },
        getProgramtype:async (_, { type }) => {
            try {
                const program=await Program.findOne({type: type});
                if (!program) throw new ApiError(404, "Programtype not found");
                return program;
            }
            catch (error) {
                console.error("Error fetching program by ID:", error);
                throw new ApiError(400, "Failed to fetch program by type");
            }
        },
        getProgramsuburb:async  (_, { suburb }) =>
        {
            const programbysuburb = await Program.findOne({location_suburb:suburb})
            if (!programbysuburb) throw new ApiError(404, "Programsuburb not found");
            return programbysuburb
        },
        getProgramstate: async (_, { state }) => {
            const programstate= await Program.findOne({location_state:state});
            if (!programstate) throw new ApiError(404, "Programstatenot found");
            return programstate;
        },
        getProgramprice: async (_, { price }) => {
            const programprice=await Program.findOne({price:{ $lt:price }});
            if (!programprice) throw new ApiError(404, "Programwith less price not found");
            return programprice;
        }
    },
};


