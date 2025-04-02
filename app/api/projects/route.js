// import { NextResponse } from "next/server";
// import { MongoClient, ObjectId, Binary } from "mongodb";
// import { writeFile } from "fs/promises";
// import { join } from "path";
// import { tmpdir } from "os";
// import { randomUUID } from "crypto";

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

// // Helper function to parse CSV data
// async function parseCSVData(text) {
//   const rows = text.split("\n");
//   if (rows.length < 2) return [];

//   const headers = rows[0].split(",").map((h) => h.trim());
//   const data = [];

//   for (let i = 1; i < rows.length; i++) {
//     if (!rows[i].trim()) continue;

//     const values = rows[i].split(",").map((v) => v.trim());
//     const item = {};

//     headers.forEach((header, index) => {
//       item[header] = values[index] || "";
//     });

//     data.push(item);
//   }

//   return data;
// }

// // Generate a unique project ID
// async function generateUniqueProjectId(db) {
//   let isUnique = false;
//   let projectId;

//   while (!isUnique) {
//     // Generate a shorter random ID (8 characters)
//     projectId = randomUUID().split("-")[0];

//     // Check if this ID already exists in the database
//     const existingProject = await db
//       .collection(COLLECTION_NAME)
//       .findOne({ projectId });

//     // If no project with this ID exists, we've found a unique ID
//     if (!existingProject) {
//       isUnique = true;
//     }
//   }

//   return projectId;
// }

// // GET handler to retrieve projects for a user
// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("userId");

//   if (!userId) {
//     return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//   }

//   try {
//     const { client, db } = await connectToDatabase();

//     const projects = await db
//       .collection(COLLECTION_NAME)
//       .find({ userId })
//       .project({ csvData: 0, "csvFile.data": 0, "csvFile.binaryData": 0 }) // Exclude large data
//       .toArray();

//     client.close();

//     return NextResponse.json(projects);
//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch projects" },
//       { status: 500 }
//     );
//   }
// }

// // POST handler to create a new project with CSV file
// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const userId = formData.get("userId");
//     const name = formData.get("name");
//     const formUrl = formData.get("formUrl");
//     const csvFile = formData.get("csvFile");

//     if (!userId || !name || !csvFile) {
//       return NextResponse.json(
//         { error: "Missing required fields or file" },
//         { status: 400 }
//       );
//     }

//     // Save the file temporarily
//     const bytes = await csvFile.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Generate temporary file path
//     const tempFilePath = join(tmpdir(), `${randomUUID()}-${csvFile.name}`);
//     await writeFile(tempFilePath, buffer);

//     // Read file content as text for parsing
//     const fileContent = buffer.toString();
//     const csvData = await parseCSVData(fileContent);

//     // Connect to the database
//     const { client, db } = await connectToDatabase();

//     // Generate a unique project ID
//     const projectId = await generateUniqueProjectId(db);

//     const newProject = {
//       userId,
//       projectId, // Add the unique project ID
//       name,
//       formUrl,
//       createdAt: new Date(),
//       csvData,
//       csvFile: {
//         filename: csvFile.name,
//         contentType: csvFile.type,
//         data: buffer.toString("base64"),
//         binaryData: new Binary(buffer),
//       },
//     };

//     // Insert the project into the database
//     const result = await db.collection(COLLECTION_NAME).insertOne(newProject);

//     client.close();

//     return NextResponse.json(
//       {
//         _id: result.insertedId,
//         userId,
//         projectId, // Include projectId in the response
//         name,
//         createdAt: newProject.createdAt,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating project:", error);
//     return NextResponse.json(
//       { error: "Failed to create project" },
//       { status: 500 }
//     );
//   }
// }

// import Project from "@/models/Project";
// import connectDB from "@/lib/connectDB";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   await connectDB();
//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get("userId");

//   try {
//     const projects = await Project.find({ userId });
//     return NextResponse.json(projects);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch projects" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req) {
//   try {
//     await connectDB();
//     console.log("Successfully connected to DB");

//     const formData = await req.formData();
//     console.log("Form data received");

//     const userId = formData.get("userId");
//     const name = formData.get("name");
//     const formUrl = formData.get("formUrl");
//     const csvFile = formData.get("csvFile");

//     console.log("Received data:", {
//       userId,
//       name,
//       formUrl,
//       hasCsvFile: !!csvFile,
//     });

//     let csvFileName = "";
//     let csvFileData = null;

//     if (csvFile) {
//       if (csvFile.size > 5 * 1024 * 1024) {
//         // 5MB limit
//         return NextResponse.json(
//           { error: "File size exceeds 5MB limit" },
//           { status: 400 }
//         );
//       }
//       const arrayBuffer = await csvFile.arrayBuffer();
//       csvFileName = csvFile.name;
//       // csvFileData = await csvFile.arrayBuffer();
//       csvFileData = Buffer.from(arrayBuffer);
//       console.log("CSV file processed, size:", csvFileData.byteLength);
//     }

//     const project = new Project({
//       userId,
//       name,
//       formUrl,
//       csvFileName,
//       csvFileData,
//     });

//     console.log("Attempting to save project");
//     await project.save();
//     console.log("Project saved successfully");

//     return NextResponse.json(project, { status: 201 });
//   } catch (error) {
//     console.error("Full error:", error);
//     console.error("Error stack:", error.stack);
//     return NextResponse.json(
//       {
//         error: "Failed to create project",
//         message: error.message,
//         details: error.stack,
//       },
//       { status: 500 }
//     );
//   }
// }

import Project from "@/models/Project";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  try {
    const projects = await Project.find({ userId });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

const generateUniqueProjectId = async () => {
  let generatedId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5; // Prevent infinite loops

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    generatedId = `PRJ_${Date.now()}_${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    try {
      const existingProject = await Project.findOne({ projectId: generatedId });
      if (!existingProject) {
        isUnique = true;
      }
    } catch (error) {
      console.error("Error checking project ID uniqueness:", error);
      if (attempts >= maxAttempts) {
        throw new Error(
          "Failed to verify project ID uniqueness after multiple attempts"
        );
      }
    }
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique project ID");
  }

  return generatedId;
};

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const userId = formData.get("userId");
    const name = formData.get("name");
    const formUrl = formData.get("formUrl");
    const csvFile = formData.get("csvFile");

    // Generate unique project ID
    const projectId = await generateUniqueProjectId();

    // Handle file upload if exists
    let csvFileName = null;
    let csvFileData = null;

    if (csvFile) {
      if (csvFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit" },
          { status: 400 }
        );
      }
      csvFileName = csvFile.name;
      csvFileData = Buffer.from(await csvFile.arrayBuffer());
    }

    // Create new project
    const project = new Project({
      projectId,
      userId,
      name,
      ...(formUrl && { formUrl }),
      ...(csvFileName && { csvFileName }),
      ...(csvFileData && { csvFileData }),
    });

    await project.save();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
