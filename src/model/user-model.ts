import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    phoneSuffix: {
      type: String,
      default: null,
    },

    username: {
      type: String,
      default: null,
      trim: true,
    },

    password: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Invalid email format",
      },
    },

    emailOtp: {
      type: String,
      default: null,
    },

    emailOtpExpires: {
      type: Date,
      default: null,
    },

    profileImage: {
      url: {
        type: String,
        default: null,
      },
      public_id: {
        type: String,
        default: null,
      },
    //   resource_type: { // type: String, // enum: ["image", "video"], // default: "image", // },
    },

    about: {
      type: String,
      default: null,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    agreed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;