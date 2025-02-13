import { Router } from "express";
import { Loginscheduler,logoutscheduler,registerEmployee, getUsersByGender,getuserdataAge,getUsersBySuburb,getUsersByState,getuserdatacity} from "../controllers/scheduler.controller.js";
import { verifyschedulerJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const SchedulerrRouter=Router()
//todo if u wanna add something add feature for data analysis
/*
so if we had to implement such a functionality what would we do in booking records
see a user by age,gender,where they live,etc
 */
SchedulerrRouter.route("/login").post(Loginscheduler)
SchedulerrRouter.route("/logout").post(verifyschedulerJWT,logoutscheduler)
SchedulerrRouter.route("/add").post(verifyschedulerJWT,
                                                                        upload.single( "img"),
                                                                        registerEmployee)
//note thid below make sure u have 2 arguments 1 min range or 1 max range or else keep it empty
SchedulerrRouter.route("/userdataAge").post(verifyschedulerJWT,getuserdataAge)
SchedulerrRouter.route("/userdataCity").post(verifyschedulerJWT,getuserdatacity)
SchedulerrRouter.route("/userdataState").post(verifyschedulerJWT,getUsersByState)
SchedulerrRouter.route("/userdataSuburb").post(verifyschedulerJWT,getUsersBySuburb)
SchedulerrRouter.route("/userdataGender").post(verifyschedulerJWT,getUsersByGender)

export default SchedulerrRouter