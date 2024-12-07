import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Scheduler } from "../models/Scheduler.model.js";
import { Program } from "../models/Program.model.js";
import { uploadonCloudinary, uploadonCloudinary_multiple } from "../utils/cloudinary.js";

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
      } = req.body;
        
      [
        { name: "type", value: type },
        { name: "programAuthorizeremail", value: programAuthorizeremail },
        { name: "pincode", value: pincode },
        { name: "location_suburb", value: location_suburb },
        { name: "location_city", value: location_city },
        { name: "location_state", value: location_state },
        { name: "direction", value: direction },
        { name: "price", value: price },
        { name: "description", value: description },
      ].forEach(({ name, value }) => {
        if (!value || value.trim() === "") {
          throw new ApiError(400, `All fields are required! Missing: ${name}`);
        }
      });


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

    const avatarPaths=req.files?.avatar

    if (!avatarPaths || avatarPaths.length===0) {
        throw new ApiError(400,"Atleast send one file")
    }
let EventImgsSrc=""
    try {
        
        const avatarlocalpaths=avatarPaths.map(file=>file.path)
        console.log("Multiple files that were uploaded were")
        EventImgsSrc=await  uploadonCloudinary_multiple(avatarlocalpaths)
        
    } catch (error) {
        console.log("Error was found while uploading pics",error)
        throw new ApiError(400,"Error in uploading pics",error)
        
    }

    console.log(`All the uploaded imgs are:${EventImgsSrc}`)
  
    const programcreated=await Program.create({

        type,
        programAuthorizeremail,
        pincode,
        location_suburb,
        location_city,
        location_state,
        direction,
        price,
        description,
        img_src:EventImgsSrc
    })

    if (!programcreated) {
        throw new ApiError(500,"Not able to add the document means cant add the entry")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,programcreated,"Lesgooooooo created the entryyy!!!!"))

})