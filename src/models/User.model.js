import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs"

const userschema = new Schema({
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
        },
        userimage: {
            type: String,
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
            unique: [true, "Email is unique"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        pincode: {
            type: String,
            required: [true,"Pincode is required"],
        },
        location_suburb: {
            type: String,
            required: [true, "Suburb location is required"],
            trim: true,
            index: true,
            lowercase: true
        },
        location_city: {
            type: String,
            required: [true, "City location is required"],
            trim: true,
            index: true,
            lowercase: true
        },
        location_state: {
            type: String,
            required: [true, "State location is required"],
            trim: true,
            index: true,
            lowercase: true
        },
        events_visited: [
            {
                type: Schema.Types.ObjectId,
                ref: "Program",
            },
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        DOB: {
            type: Date,
            required: [true, "Date of birth is required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {timestamps: true}
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
