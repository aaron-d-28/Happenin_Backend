import express from "express";
import connectDB from "./db/index.js";
import dotenv from 'dotenv'
import {app} from './app.js'
dotenv.config({
    path:'./.env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 9000,()=>{
        console.log(`Server is runing on Port:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection has failed aaron:",err)
})
Apollo()







// ;(async()=>{
// try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//     app.on("error",(error)=>{
//         console.log("Error found here aaron",error);
//         throw error
//     })
//     app.listen(process.env.PORT,(=>{
//         console.log(`App is listening on port ${process.env.PORT}`)
//     }))
// } catch (error) {
     
// }

// })()