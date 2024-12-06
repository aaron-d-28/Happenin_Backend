import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Scheduler } from "../models/Scheduler.model.js";
import { Program } from "../models/Program.model.js";

const addprogram=asyncHandler(async(req,res)=>{
    // note add multer and clpudinary to upload program img 
    // note later work on further things
    const {
        type,
        programAuthorizeremail,
        pincode,
        location_suburb,
        location_city,
        location_state,
        direction,
        price,
        description,
        img_src,
      } = req.body;
      
    const scheduler=Scheduler.findById(req.scheduler._id)

    if (!scheduler) {
        throw new ApiError(400,"Scheduler not found")
    }

    const ttlevents=await Program.countDocuments(
        {
            programAuthorizeremail:scheduler.email
            // note if this is a aggreagte pipeline us $first 
        }
    )
    
    if (scheduler.type=="Business" && ttlevents===1) {
        throw new ApiError(400,"A business can only add 1 event")
    }

})