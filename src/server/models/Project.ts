import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["Planning", "Active", "On Hold", "Completed", "Cancelled"],
      default: "Active",
    },
    deadline: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    color: { type: String, default: "#6366F1" },
    icon: { type: String, default: "folder" },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", ProjectSchema);
