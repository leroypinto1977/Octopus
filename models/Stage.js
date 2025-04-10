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
  },
  {
    timestamps: true,
    collection: "stages",
  }
);

// Proper model registration
const Stage = mongoose.models.Stage || mongoose.model("Stage", stageSchema);

export default Stage;
