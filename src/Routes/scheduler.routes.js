import { Router } from "express";
import { Loginscheduler,logoutscheduler } from "../controllers/scheduler.controller.js";
import { verifyschedulerJWT } from "../middlewares/auth.middleware.js";

const SchedulerrRouter=Router()

SchedulerrRouter.route("/login").post(Loginscheduler,verifyschedulerJWT)
SchedulerrRouter.route("/logout").post(logoutscheduler)

export default SchedulerrRouter