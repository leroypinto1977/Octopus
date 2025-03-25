import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
const DB_NAME = "startup_singham";
const COLLECTION_NAME = "projects";

// Connect to MongoDB
async function connectToDatabase() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  return { client, db };
}

// DELETE handler to remove a project
export async function DELETE(request, { params }) {
  const { projectId } = params;

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const { client, db } = await connectToDatabase();

    const result = await db
      .collection(COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(projectId) });

    client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

// // File: /api/projects/[projectId]/process-stage/route.js
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

// export async function POST(request, { params }) {
//   const projectId = params.projectId;

//   if (!projectId) {
//     return NextResponse.json(
//       { error: "Project ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const formData = await request.formData();
//     const stageName = formData.get("stageName");

//     if (!stageName) {
//       return NextResponse.json(
//         { error: "Stage name is required" },
//         { status: 400 }
//       );
//     }

//     // Connect to the database
//     const { client, db } = await connectToDatabase();

//     // Retrieve the project with its binary CSV data
//     const project = await db.collection(COLLECTION_NAME).findOne({
//       _id: new ObjectId(projectId),
//     });

//     if (!project) {
//       client.close();
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     // Extract the binary data
//     const csvBinaryData = project.csvFile.binaryData;

//     // Update the project with stage processing result
//     await db.collection(COLLECTION_NAME).updateOne(
//       { _id: new ObjectId(projectId) },
//       {
//         $set: {
//           [`stageResults.${stageName}`]: {
//             processedAt: new Date(),
//             status: "completed",
//             // Add any additional result data here
//           },
//         },
//       }
//     );

//     client.close();

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error processing stage:", error);
//     return NextResponse.json(
//       { error: "Failed to process stage" },
//       { status: 500 }
//     );
//   }
// }
