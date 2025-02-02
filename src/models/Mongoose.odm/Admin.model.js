import mongoose,{  Schema} from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
const adminschema=new Schema(
    {
        name:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
        },
        password:{
            type:String,
            required:[true,'Password is required'],

        },
        appointedschedulerid:[{
            type:Schema.Types.ObjectId,
            ref:"Scheduler"
        }],
        email:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
            unique:true
        },
        refreshToken:{
            type:String
          },
    },
    
    {timestamps:true}
)
adminschema.pre("save",async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password=await bcrypt.hash(this.password,10)
        next()
    } catch (error) {
        next(error)
    }


}),
adminschema.methods.isPasswordcorrect=async function (password) {
    return await bcrypt.compare(password,this.password);
}

//todo add jwt application here probably


adminschema.methods.GenerateAccessToken=function(){
  try {
      return jwt.sign({
          _id:this._id ,
          email:this.email,
          name:this.name
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
  )
  } catch (error) {
    console.log("Error in generation",error)
  }
}
adminschema.methods.GenerateRefreshToken=function(){
   try {
     return jwt.sign({
         _id:this._id ,
         
     },
     process.env.REFRESH_TOKEN_SECRET,
     { expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
 )
   } catch (error) {

    console.log("Error in refresh",error)
   }

}
export const Admin=mongoose.model("Admin",adminschema)