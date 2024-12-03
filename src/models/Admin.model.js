import mongoose,{  Schema} from "mongoose";
import bcrypt from "bcryptjs"
const adminschema=new Schema(
    {
        fullname:{
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
        }
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
export const Admin=mongoose.model("Admin",adminschema)