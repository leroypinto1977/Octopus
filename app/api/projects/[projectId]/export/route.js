// // File: /api/projects/[projectId]/export/route.js
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

// export async function GET(request, { params }) {
//   const projectId = params.projectId;

//   if (!projectId) {
//     return NextResponse.json(
//       { error: "Project ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
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
//     const csvBinaryData = project.csvFile.binaryData.buffer;

//     client.close();

//     // Return the binary data as a downloadable file
//     return new NextResponse(csvBinaryData, {
//       headers: {
//         "Content-Type": "text/csv",
//         "Content-Disposition": `attachment; filename="${project.name.replace(
//           /\s+/g,
//           "_"
//         )}_export.csv"`,
//       },
//     });
//   } catch (error) {
//     console.error("Error exporting project:", error);
//     return NextResponse.json(
//       { error: "Failed to export project" },
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

    if (!project.csvFileData) {
      return NextResponse.json(
        { error: "No CSV file data available" },
        { status: 404 }
      );
    }

    // Create a response with the CSV file data
    const response = new NextResponse(project.csvFileData);
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=${
        project.csvFileName || `project-${projectId}.csv`
      }`
    );
    response.headers.set("Content-Type", "text/csv");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export project" },
      { status: 500 }
    );
  }
}
