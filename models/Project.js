// import mongoose from "mongoose";

// const projectSchema = new mongoose.Schema(
//   {
//     projectId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     userId: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     formUrl: {
//       type: String,
//       required: false,
//     },
//     csvFileName: {
//       type: String,
//       required: false,
//     },
//     csvFileData: {
//       type: Buffer,
//       required: false,
//     },
//     stages: {
//       type: Object,
//       default: {},
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     validateBeforeSave: true,
//     strict: "throw",
//     collection: "projects", // Explicit collection name
//   }
// );

// // Add indexes for better query performance
// projectSchema.index({ projectId: 1 }, { unique: true });
// projectSchema.index({ userId: 1 });

// // Handle model compilation in a way that works with Next.js HMR
// const Project =
//   mongoose.models.Project || mongoose.model("Project", projectSchema);

// export default Project;

import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Remove duplicate index definition
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    formUrl: String,
    csvFileName: String,
    csvFileData: Buffer,
    stages: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    validateBeforeSave: true,
    strict: "throw",
    collection: "projects", // Explicit collection name
  }
);

// Remove all index definitions here since we're using inline index: true
const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
