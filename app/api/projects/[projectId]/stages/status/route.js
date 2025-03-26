import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
const DB_NAME = "startup_singham";
const COLLECTION_NAME = "stages";

async function connectToDatabase() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  return { client, db };
}

export async function GET(request, { params }) {
  const { projectId } = params;

  try {
    const { client, db } = await connectToDatabase();

    const result = await db
      .collection(COLLECTION_NAME)
      .find({
        projectId: new ObjectId(projectId),
      })
      .toArray();

    client.close();

    return NextResponse.json({
      stage1: result.some((doc) => doc.stageNumber === 1),
      stage2: result.some((doc) => doc.stageNumber === 2),
      stage3: result.some((doc) => doc.stageNumber === 3),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission status" },
      { status: 500 }
    );
  }
}
