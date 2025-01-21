import  {Router} from "express";
import  {registeruser,loginuser} from "../controllers/user.controller.js"

const userrouter = Router();
userrouter.route("/register").post(registeruser);
userrouter.route("/login").post(loginuser);

export {userrouter}