import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
const DB_NAME = "startup_singham";
const COLLECTION_NAME = "stages";

// Connect to MongoDB
async function connectToDatabase() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  return { client, db };
}

// POST handler to save stage data
export async function POST(request, { params }) {
  const { projectId } = params;

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    );
  }

  try {
    const { client, db } = await connectToDatabase();
    const body = await request.json();

    const { projectName, stageNumber, parameters } = body;

    // Save stage data
    const result = await db.collection(COLLECTION_NAME).insertOne({
      projectId: new ObjectId(projectId),
      projectName,
      stageNumber,
      parameters,
      createdAt: new Date(),
    });

    client.close();

    return NextResponse.json(
      {
        _id: result.insertedId,
        projectId,
        projectName,
        stageNumber,
        parameters,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save stage data" },
      { status: 500 }
    );
  }
}
