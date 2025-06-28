import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role :{type:String, enum:['admin', 'user'], default: 'user'},
  profilePic: {type: String, default: null},
  isAccountVerified: {type: Boolean, default: false},
  verifyOtp: {type: String, default: null},
  verifyOtpExpireAt: {type: Date, default: null},
  resetOtp: {type:String, default: null},
  resetOtpExpireAt: {type: Date, default: null},
});

const User = mongoose.model("User", userSchema);

export default User;
