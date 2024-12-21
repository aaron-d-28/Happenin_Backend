import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
const Schedulerschema = new Schema({
  type: {
    type: String,
    enum: ["Govt", "Public", "Business", "Test"],
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
  authorizerid: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  refreshtoken: {
    type: String,
  },
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

Schedulerschema.methods.GenerateAccessToken = function () {
  try {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        name: this.name,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  } catch (error) {
    console.log("Error is in access",error)
  }
};
Schedulerschema.methods.GenerateRefreshToken = function () {
  try {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  } catch (error) {
    console.log("Error is in refresh",error)
  }
};

export const Scheduler = mongoose.model("Scheduler", Schedulerschema);
