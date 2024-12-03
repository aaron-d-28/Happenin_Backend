import mongoose,{ Schema } from "mongoose";

const userschema=new Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
    },
    gender:{
        type:String,
        enum:["Male","Female","Others"],
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    phone:{
        type:String,
        required:true,
        trim:true
    },
    user_location:{
        type:String,
        required:true,
        trim:true
    },
    events_visited:[{
        type:Schema.Types.ObjectId,
        ref:"Program"
    }]

},
{timestamps:true}
)

export const User=mongoose.model("User",userschema)