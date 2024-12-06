import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,//Means telss us what all sites can access our backend site eg we dont want facebooks to access sbi api
    credentials:true
}))
app.use(express.json({//Means to tell express to accept json req and how much size
    limit:"16kb"
}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))  //Means encodes the data in the url for reasons of special chara or spaces extended object uses extended true
app.use(express.static("public"))//Means tells us which folder holds images used in cloudinary multer stuff
app.use(cookieParser()) 

// //note routes import
// import userRouter from "./routes/user.routes.js"



// //Note routes Declaration
// app.use("/api/v1/users",userRouter)


export {app}