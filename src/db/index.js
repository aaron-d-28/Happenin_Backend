import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\nMongoDB connected aaron!!! DB Host:${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Aaron mongo db is connection error: probable cause is no wifi",error)
        process.exit(1)
    }
}
export default connectDB