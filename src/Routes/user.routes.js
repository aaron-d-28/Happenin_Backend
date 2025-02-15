import  {Router} from "express";
import  {registeruser,loginuser} from "../controllers/user.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js";

const userrouter = Router();
userrouter.route("/register").post(registeruser);
userrouter.route("/login").post(loginuser);

export {userrouter}