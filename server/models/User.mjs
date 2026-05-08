import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    phone:       { type: String, required: true, unique: true, trim: true },   // PRIMARY login identifier
    password:    { type: String, required: true, minlength: 6, select: false },
    country:     { type: String, default: "" },
    countryCode: { type: String, default: "" },
    address:     { type: String, default: "" },
    city:        { type: String, default: "" },
    profilePic:  { type: String, default: "" },
    role:        { type: String, enum: ["farmer", "admin"], default: "farmer" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
