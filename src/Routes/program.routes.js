import { addprogram,updateprogram, } from "../controllers/program.controller.js";
import {  Router} from "express";
import {verifyschedulerJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";

const Programrouter=Router()

Programrouter.route("/Addprogram").post(verifyschedulerJWT,upload.fields([
    {name:"images",maxCount:4},
    
]),
addprogram
)

Programrouter.route("/Update").post(verifyschedulerJWT,updateprogram)


export default Programrouter