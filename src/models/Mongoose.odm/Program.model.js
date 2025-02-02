import mongoose, { Schema } from "mongoose";

const programschema = new Schema({
  type: {
    type: String,
    enum: ["Govt", "Business", "Public","Test"],
    required: [true, "Program type is required"],
    index: true,
  },
  programAuthorizerid: {
    type: Schema.Types.ObjectId,
    ref: "Scheduler",
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
    lowercase:true
  },
  location_city: {
    type: String,
    required: [true, "City location is required"],
    trim: true,
    index: true,
    lowercase:true
  },
  location_state: {
    type: String,
    required: [true, "State location is required"],
    trim: true,
    index: true,
    lowercase:true
  },
  direction: {
    type: String,
    required: [true, "Direction is required"],
    trim: true,
  },
  current_users: {
    type: Number,
  },
  total_users: {
    type: Number,
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
    type: [String],
    required: [true, "At least one image source is required"],
    validate: {
      validator: function (value) {
        return value.length > 0; // Ensure the array is not empty
      },
      message: "At least one image source is required",
    },
    trim: true,
  },
  
});

export const Program = mongoose.model("Program", programschema);
