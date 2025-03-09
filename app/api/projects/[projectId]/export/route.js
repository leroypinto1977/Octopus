// import { NextResponse } from "next/server";
// import { MongoClient, ObjectId } from "mongodb";
// import { Parser } from "json2csv";

// // MongoDB connection string - replace with your actual connection string
// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/Octopus";
// const DB_NAME = "Octopus";
// const COLLECTION_NAME = "Projects";

// // Connect to MongoDB
// async function connectToDatabase() {
//   const client = await MongoClient.connect(MONGODB_URI);
//   const db = client.db(DB_NAME);
//   return { client, db };
// }

// // GET handler to export project CSV
// export async function GET(request, { params }) {
//   const { projectId } = params;

//   if (!projectId) {
//     return NextResponse.json(
//       { error: "Project ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const { client, db } = await connectToDatabase();

//     const project = await db
//       .collection(COLLECTION_NAME)
//       .findOne({ _id: new ObjectId(projectId) });

//     client.close();

//     if (!project) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     // Check if we have CSV data
//     if (
//       !project.csvData ||
//       !Array.isArray(project.csvData) ||
//       project.csvData.length === 0
//     ) {
//       // If no structured data, try to use the original file
//       if (project.csvFile && project.csvFile.data) {
//         const csvBuffer = Buffer.from(project.csvFile.data, "base64");
//         const response = new NextResponse(csvBuffer);
//         response.headers.set("Content-Type", "text/csv");
//         response.headers.set(
//           "Content-Disposition",
//           `attachment; filename=project-${projectId}.csv`
//         );
//         return response;
//       } else {
//         return NextResponse.json(
//           { error: "No CSV data available for this project" },
//           { status: 404 }
//         );
//       }
//     }

//     // Convert JSON data back to CSV
//     const fields = Object.keys(project.csvData[0]);
//     const parser = new Parser({ fields });
//     const csv = parser.parse(project.csvData);

//     // Return the CSV as a download
//     const response = new NextResponse(csv);
//     response.headers.set("Content-Type", "text/csv");
//     response.headers.set(
//       "Content-Disposition",
//       `attachment; filename=project-${projectId}.csv`
//     );

//     return response;
//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { error: "Failed to export project" },
//       { status: 500 }
//     );
//   }
// }

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

// Helper function to convert JSON to CSV
function jsonToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const headerRow = headers.join(",");

  const rows = data.map((row) => {
    return headers
      .map((fieldName) => {
        const value = row[fieldName] || "";
        // Escape quotes and wrap with quotes if contains comma
        return typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(",");
  });

  return [headerRow, ...rows].join("\n");
}

// GET handler to export project CSV
export async function GET(request, { params }) {
  const { projectId } = params;

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const { client, db } = await connectToDatabase();

    const project = await db
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(projectId) });

    client.close();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if we have CSV data
    if (
      !project.csvData ||
      !Array.isArray(project.csvData) ||
      project.csvData.length === 0
    ) {
      // If no structured data, try to use the original file
      if (project.csvFile && project.csvFile.data) {
        const csvBuffer = Buffer.from(project.csvFile.data, "base64");
        return new NextResponse(csvBuffer, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=project-${projectId}.csv`,
          },
        });
      } else {
        return NextResponse.json(
          { error: "No CSV data available for this project" },
          { status: 404 }
        );
      }
    }

    // Convert JSON data back to CSV
    const csvContent = jsonToCSV(project.csvData);

    // Return the CSV as a download
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=project-${projectId}.csv`,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to export project" },
      { status: 500 }
    );
  }
}
