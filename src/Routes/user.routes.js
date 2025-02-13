import  {Router} from "express";
import  {registeruser,loginuser} from "../controllers/user.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js";

const userrouter = Router();
userrouter.route("/register").post(verifyJWT,registeruser);
userrouter.route("/login").post(verifyJWT,loginuser);

export {userrouter}