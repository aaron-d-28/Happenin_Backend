import { Router } from "express";
import {  Loginadmin,Logoutadmin,addscheduler, test,addadmintest,getallSheduler} from "../controllers/admin.controller.js";
import {verifyadminJWT} from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/login").post(Loginadmin)

router.route("/logout").post(verifyadminJWT,Logoutadmin)

router.route("/test").get(test)

router.route("/add").get(addadmintest)

router.route("/getScheduler").get(verifyadminJWT,getallSheduler)

router.route("/addScheduler").post(verifyadminJWT,addscheduler)

export default router