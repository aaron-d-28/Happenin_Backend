import {Router} from "express";
import {  retriveall,addrecord } from "../controllers/Bookinrecords.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const bookingrouter = Router();
bookingrouter.route("/test").get(verifyJWT,retriveall)
bookingrouter.route("/add").get(verifyJWT,addrecord)

export default bookingrouter;