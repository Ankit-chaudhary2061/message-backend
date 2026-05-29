import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
phoneNumber: { type: String, required: true, unique: true },
phoneSuffix: { type: String, required: true },


    username: { type: String, required: true},
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, validate: {
        validator: function (v: string) {
            return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        }
    }} ,
    emailOtp: { type: String },
    emailOtpExpires: { type: Date },
    profilePicture: { type: String },
    about: { type: String },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreed:{ type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)
export default User