import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Review", "Completed"],
      default: "Todo",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    labels: [{ type: String, trim: true }],
    dueDate: { type: Date },
    completedAt: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    progressColor: { type: String, default: "#6366F1" },
    comments: [CommentSchema],
    attachments: [{ name: String, url: String, type: String, size: Number }],
    subtasks: [SubtaskSchema],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-set completedAt when status becomes Completed
TaskSchema.pre("save", function (this: any) {
  if (this.isModified("status") && this.status === "Completed" && !this.completedAt) {
    this.completedAt = new Date();
  }
  if (this.isModified("status") && this.status !== "Completed") {
    this.completedAt = undefined;
  }
});

export const Task = mongoose.model("Task", TaskSchema);
