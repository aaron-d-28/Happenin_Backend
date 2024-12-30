import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Scheduler } from "../models/Scheduler.model.js";
import { Program } from "../models/Program.model.js";
import { uploadonCloudinary, uploadonCloudinary_multiple } from "../utils/cloudinary.js";
import mongoose from "mongoose";
const addprogram=asyncHandler(async(req,res)=>{
    // note add multer and clpudinary to upload program img 
    // note later work on further things
    const {
        type,
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

    const avatarPaths=req.files?.images

    if (!avatarPaths || avatarPaths.length===0) {
        throw new ApiError(400,"Atleast send one file")
    }
let EventImgsSrc=""
    try {
        
        const avatarlocalpaths=avatarPaths.map(file=>file.path)
        console.log("Multiple files that were uploaded were",avatarlocalpaths)
        EventImgsSrc=await  uploadonCloudinary_multiple(avatarlocalpaths)
        
    } catch (error) {
        console.log("Error was found while uploading pics",error)
        throw new ApiError(400,"Error in uploading pics",error)
        
    }

    console.log(`All the uploaded imgsurl are:${EventImgsSrc}`)


  
    const programcreated=await Program.create({

        type,
        programAuthorizerid:req.scheduler._id,
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
    const updatedcheduler=await Scheduler.findByIdAndUpdate(
        req.scheduler._id,
        {$set: {programid: programcreated._id}},
        { new: true }

)
    if (!updatedcheduler)
    {
        console.log(`Updated scheduler error check program:${programcreated._id} then for scheduler:${updatedcheduler}`)
        throw  new ApiError(400,"Error in updating Scheduler pics",error)
    }


    return res
    .status(200)
    .json(new ApiResponse(200,programcreated,"Lesgooooooo created the entryyy!!!!"))

})

const updateprogram=asyncHandler(async(req,res)=>{
    const {
        _id, 
        type,
        programAuthorizerid,
        pincode,
        location_suburb,
        location_city,
        location_state,
        direction,
        price,
        description,}=req.body
        
        if (!_id) {
            throw new ApiError(400,"Send atleast the id of the program to update")
        }
        const program=await Program.findOne(
            {
                _id:_id
            }
        )

        if (program.programAuthorizerid.toString()!=req.scheduler._id.toString()) {
            throw new ApiError(400,`${program.programAuthorizerid} and ${req.scheduler._id} dont have that authority`)
        }


        if (!program) {
            throw new ApiError(400,`No program with the program ${_id} id `)
        }

        const updatedfield={ type  : type?.trim() || program.type  ,
            programAuthorizerid  : programAuthorizerid?.trim() || program.programAuthorizerid  ,
            pincode  : pincode?.trim() || program.pincode  ,
            location_suburb  : location_suburb?.trim() || program.location_suburb  ,
            location_city  : location_city?.trim() || program.location_city  ,
            location_state  : location_state?.trim() || program.location_state  ,
            direction  : direction?.trim() || program.direction  ,
            price  : price?.trim() || program.price  ,
            description  : description?.trim() || program.description  ,}
        
            // console.log(updatedfield)

        const updatedprogram=await Program.findByIdAndUpdate(_id,
            {$set:updatedfield},
            { new: true, runValidators: true }
        )


        if (!updatedprogram) {
        throw new ApiError(500, "Failed to update the program for ",updatedprogram);
        }

        res.status(200).json({
            message: "Program updated successfully this is the new program",
            program: updatedprogram,
        });

        //steps how do we know what thing we r updating req.some? or do we get the id from there 
        
})


export {addprogram,updateprogram}