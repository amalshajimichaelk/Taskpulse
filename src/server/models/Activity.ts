import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "created", "moved", "completed", "commented"
    target: { type: String, required: true }, // target name (task/project title)
    targetType: { type: String, enum: ["task", "project", "comment", "user"], default: "task" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    meta: { type: mongoose.Schema.Types.Mixed }, // extra context (e.g. old/new status)
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", ActivitySchema);
