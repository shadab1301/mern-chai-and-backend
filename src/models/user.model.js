import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Fullname is required"],
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String, // we will use cloudnary
      required: [true, "Avatar is required"],
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vedio",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hash(this.password, 10);
    return next();
  }
  next();
});

UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

UserSchema.methods.generateAccessToken = async function () {
return jwt.sign(
  {
    _id: this._id,
    email: this.email,
    userName: this.userName,
    fullName: this.fullName,
  },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
);
};
UserSchema.methods.generateRefreshToken = async function () {
 return jwt.sign(
   {
     _id: this._id,
   },
   process.env.REFRESH_TOKEN_SECRET,
   { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
 );
};

export const User = mongoose.model("User", UserSchema);
