import { Router } from "express";
import { Loginscheduler,logoutscheduler,registerEmployee, } from "../controllers/scheduler.controller.js";
import { verifyschedulerJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const SchedulerrRouter=Router()

SchedulerrRouter.route("/login").post(Loginscheduler)
SchedulerrRouter.route("/logout").post(verifyschedulerJWT,logoutscheduler)
SchedulerrRouter.route("/add").post(verifyschedulerJWT,
                                                                        upload.single( "img"),
                                                                        registerEmployee)

export default SchedulerrRouter