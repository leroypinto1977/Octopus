import mongoose from "mongoose";

const stageSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    stageNumber: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
    },
    parameters: {
      type: Map,
      of: [String],
      default: {},
    },
    status: {
      type: String,
      enum: ["not_started", "processing", "completed"],
      default: "not_started",
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "stages",
  }
);

// Proper model registration
const Stage = mongoose.models.Stage || mongoose.model("Stage", stageSchema);

export default Stage;
