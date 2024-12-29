import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const EmployeeSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            trim: true,
        },
        Schedulerid: {
            type: Schema.Types.ObjectId,
            ref: "Scheduler",
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        empimg: {
            type: String,
            required: [true, "Employee image is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {timestamps: true}
);

// Pre-save middleware to hash the password before saving
EmployeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
EmployeeSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

EmployeeSchema.methods.GenerateAccessToken = function () {
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
EmployeeSchema.methods.GenerateRefreshToken = function () {
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


export const Employee = mongoose.model("Employee", EmployeeSchema);
