import { Router } from "express";
import { Loginscheduler,logoutscheduler } from "../controllers/scheduler.controller.js";
import { verifyschedulerJWT } from "../middlewares/auth.middleware.js";

const SchedulerrRouter=Router()

SchedulerrRouter.route("/login").post(Loginscheduler)
SchedulerrRouter.route("/logout").post(verifyschedulerJWT,logoutscheduler)

export default SchedulerrRouter