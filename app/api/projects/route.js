import { NextResponse } from "next/server";
import { MongoClient, ObjectId, Binary } from "mongodb";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

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

// Helper function to parse CSV data
async function parseCSVData(text) {
  const rows = text.split("\n");
  if (rows.length < 2) return [];

  const headers = rows[0].split(",").map((h) => h.trim());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue;

    const values = rows[i].split(",").map((v) => v.trim());
    const item = {};

    headers.forEach((header, index) => {
      item[header] = values[index] || "";
    });

    data.push(item);
  }

  return data;
}

// GET handler to retrieve projects for a user
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const { client, db } = await connectToDatabase();

    const projects = await db
      .collection(COLLECTION_NAME)
      .find({ userId })
      .project({ csvData: 0, "csvFile.data": 0, "csvFile.binaryData": 0 }) // Exclude large data
      .toArray();

    client.close();

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST handler to create a new project with CSV file
export async function POST(request) {
  try {
    // const formData = await request.formData();
    // const userId = formData.get("userId");
    // const name = formData.get("name");
    // const csvFile = formData.get("csvFile");

    const formData = await request.formData();
    const userId = formData.get("userId");
    const name = formData.get("name");
    const formUrl = formData.get("formUrl"); // Add this line
    const csvFile = formData.get("csvFile");

    if (!userId || !name || !csvFile) {
      return NextResponse.json(
        { error: "Missing required fields or file" },
        { status: 400 }
      );
    }

    // Save the file temporarily
    const bytes = await csvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate temporary file path
    const tempFilePath = join(tmpdir(), `${randomUUID()}-${csvFile.name}`);
    await writeFile(tempFilePath, buffer);

    // Read file content as text for parsing
    const fileContent = buffer.toString();
    const csvData = await parseCSVData(fileContent);

    // Connect to the database
    const { client, db } = await connectToDatabase();

    // Create a new project document
    // const newProject = {
    //   userId,
    //   name,
    //   createdAt: new Date(),
    //   csvData,
    //   csvFile: {
    //     filename: csvFile.name,
    //     contentType: csvFile.type,
    //     data: buffer.toString("base64"), // Store file as base64 string
    //     binaryData: new Binary(buffer), // Store file as binary data
    //   },
    // };

    const newProject = {
      userId,
      name,
      formUrl, // Add this to your document
      createdAt: new Date(),
      csvData,
      csvFile: {
        filename: csvFile.name,
        contentType: csvFile.type,
        data: buffer.toString("base64"),
        binaryData: new Binary(buffer),
      },
    };

    // Insert the project into the database
    const result = await db.collection(COLLECTION_NAME).insertOne(newProject);

    client.close();

    return NextResponse.json(
      {
        _id: result.insertedId,
        userId,
        name,
        createdAt: newProject.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
