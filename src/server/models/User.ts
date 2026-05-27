import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false, minlength: 6 },
    role: {
      type: String,
      enum: ["Admin", "Project Manager", "Team Member", "Viewer"],
      default: "Team Member",
    },
    avatar: { type: String },
    bio: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    location: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    online: { type: Boolean, default: false },
    lastSeen: { type: Date },
    notificationPrefs: {
      taskAssigned: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: true },
      deadlineReminder: { type: Boolean, default: true },
      teamUpdates: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
