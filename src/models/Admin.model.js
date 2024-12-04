import mongoose,{  Schema} from "mongoose";
import bcrypt from "bcryptjs"
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
        appointed:{
            type:Schema.Types.ObjectId,
            ref:"Scheduler"
        },
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
    if (this.isModified("password")) return next();

    try {
        this.password=await bcrypt.hash(this.password,10)
    } catch (error) {
        next(error)
    }


},
adminschema.methods.isPasswordcorrect=async function (password) {
    return await bcrypt.compare(password,this.password);
}
)
//todo add jwt application here probably


adminschema.methods.GenerateAccessToken=function(){
    return jwt.sign({
        _id:this._id ,
        email:this.email,
        name:this.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
)
}
adminschema.methods.GenerateRefreshToken=function(){
    return jwt.sign({
        _id:this._id ,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
)

}
export const Admin=mongoose.model("Admin",adminschema)