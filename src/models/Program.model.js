import mongoose, { Schema } from "mongoose";

const programschema = new Schema({
  type: {
    type: String,
    enum: ["Govt", "Business", "Public"],
    required: [true, "Program type is required"],
    index: true,
  },
  programAuthorizer: {
    type: Schema.Types.ObjectId,
    ref: "Scheduler",
    required: [true, "Authorizer is required"],
  },
  pincode:{
    type:String,
    required:true
  },
  location_suburb: {
    type: String,
    required: [true, "Suburb location is required"],
    trim: true,
    index: true,
  },
  location_city: {
    type: String,
    required: [true, "City location is required"],
    trim: true,
    index: true,
  },
  location_state: {
    type: String,
    required: [true, "State location is required"],
    trim: true,
    index: true,
  },
  direction: {
    type: String,
    required: [true, "Direction is required"],
    trim: true,
  },
  current_users: {
    type: Number,
    required: [true, "Current users count is required"],  // Optional field but can be required if necessary
  },
  total_users: {
    type: Number,
    required: [true, "Total users count is required"],  // Optional field but can be required if necessary
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  img_src: {
    type: String,
    required: [true, "Image source is required"],
    trim: true,
  },
});

export const Program = mongoose.model("Program", programschema);
