import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs"
const userschema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: [true, "Gender is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    user_location: {
      type: String,
      required: [true, "User location is required"],
      trim: true,
    },
    events_visited: [
      {
        type: Schema.Types.ObjectId,
        ref: "Program",
      },
    ],
    password:{
        type:String,
        required:[true,"Password is required"],
    }
  },
  { timestamps: true }
);
userschema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    // console.log("Plain password:", this.password);  // Check the value of `this.password`
  
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (error) {
      next(error);
    }
  });
  
  userschema.methods.isPasswordcorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };  
export const User = mongoose.model("User", userschema);
