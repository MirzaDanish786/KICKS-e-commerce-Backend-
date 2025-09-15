import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role :{type:String, enum:['admin', 'user'], default: 'user'},
  avatar: {type: String, default: null},
  isAccountVerified: {type: Boolean, default: false},
  verifyOtp: {type: String, default: null},
  verifyOtpExpireAt: {type: Date, default: null},
  resetOtp: {type:String, default: null},
  resetOtpExpireAt: {type: Date, default: null},
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password; 
    delete ret.verifyOtp;     
    delete ret.verifyOtpExpireAt;
    delete ret.resetOtp;
    delete ret.resetOtpExpireAt;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
