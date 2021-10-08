import mongoose from "mongoose";
const { Schema, model } = mongoose;
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["host", "guest"],
      default: "guest",
    },
    facebookId: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.statics.checkUser = async function (email, userPassword) {
  const findUser = await this.findOne({ email });
  console.log(findUser.email, findUser.password);
  if (await bcrypt.compare(userPassword, findUser.password)) {
    return findUser;
  } else {
    return null;
  }
};
export default model("User", userSchema);
