import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define the user schema
const userschema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
            unique: true,
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
            required: [true, "Pincode is required"],
        },
        location_suburb: {
            type: String,
            required: [true, "Suburb location is required"],
            trim: true,
            index: true,
            lowercase: true,
        },
        location_city: {
            type: String,
            required: [true, "City location is required"],
            trim: true,
            index: true,
            lowercase: true,
        },
        location_state: {
            type: String,
            required: [true, "State location is required"],
            trim: true,
            index: true,
            lowercase: true,
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
        Age: {
            type: Number,
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

// Middleware to hash the password before saving
userschema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userschema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate an access token
userschema.methods.GenerateAccessToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    } catch (error) {
        console.error("Error in access token generation:", error);
        throw error; // Propagate the error to the caller
    }
};

// Method to generate a refresh token
userschema.methods.GenerateRefreshToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );
    } catch (error) {
        console.error("Error in refresh token generation:", error);
        throw error; // Propagate the error to the caller
    }
};

// Export the User model
export const User = mongoose.model("User", userschema);