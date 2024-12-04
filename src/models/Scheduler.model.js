import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const Schedulerschema = new Schema({
  type: {
    type: String,
    enum: ["Govt", "Public", "Business"],
    required: [true, "Type is required"],
    index: true,
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    lowercase: true,
    trim: true,
  },
  commission: {
    type: Number,
    required: [true, "Commission is required"],
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer",
    },
    min: [0, "Percentage cannot be less than 0"],
    max: [100, "Percentage cannot exceed 100"],
  },
  authorizeremail: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: [true, "Authorizer is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email:{
    type: String,
    required: [true, "email is required"],
    unique:true
  }
});

Schedulerschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // console.log("Plain password:", this.password);  // Check the value of `this.password`

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

Schedulerschema.methods.isPasswordcorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};  



export const Scheduler=mongoose.model("Scheduler", Schedulerschema);
