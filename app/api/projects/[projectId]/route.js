// import { NextResponse } from "next/server";
// import { MongoClient, ObjectId } from "mongodb";

// // MongoDB connection string
// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
// const DB_NAME = "startup_singham";
// const COLLECTION_NAME = "projects";

// // Connect to MongoDB
// async function connectToDatabase() {
//   const client = await MongoClient.connect(MONGODB_URI);
//   const db = client.db(DB_NAME);
//   return { client, db };
// }

// // DELETE handler to remove a project
// export async function DELETE(request, { params }) {
//   const { projectId } = params;

//   if (!projectId) {
//     return NextResponse.json(
//       { error: "Project ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const { client, db } = await connectToDatabase();

//     const result = await db
//       .collection(COLLECTION_NAME)
//       .deleteOne({ _id: new ObjectId(projectId) });

//     client.close();

//     if (result.deletedCount === 0) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { error: "Failed to delete project" },
//       { status: 500 }
//     );
//   }
// }

import Project from "@/models/Project";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { projectId } = params;

  try {
    const project = await Project.findOne({ projectId });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { projectId } = params;

  try {
    const result = await Project.deleteOne({ projectId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
