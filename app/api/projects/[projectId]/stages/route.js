// import { NextResponse } from "next/server";
// import { MongoClient, ObjectId } from "mongodb";

// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
// const DB_NAME = "startup_singham";
// const COLLECTION_NAME = "stages";

// async function connectToDatabase() {
//   const client = await MongoClient.connect(MONGODB_URI);
//   const db = client.db(DB_NAME);
//   return { client, db };
// }

// export async function POST(request, { params }) {
//   const { projectId } = params;

//   try {
//     const { client, db } = await connectToDatabase();
//     const { stageNumber, parameters } = await request.json();

//     // First check if stage already exists
//     const existingStage = await db.collection(COLLECTION_NAME).findOne({
//       projectId: new ObjectId(projectId),
//       stageNumber,
//     });

//     if (existingStage) {
//       client.close();
//       return NextResponse.json(
//         { error: "Parameters for this stage already submitted" },
//         { status: 400 }
//       );
//     }

//     // Prepare document with arrays for each parameter
//     const stageDoc = {
//       projectId: new ObjectId(projectId),
//       stageNumber,
//       parameters: {},
//       createdAt: new Date(),
//     };

//     // Convert parameters to arrays
//     for (const [param, value] of Object.entries(parameters)) {
//       stageDoc.parameters[param] = [value];
//     }

//     const result = await db.collection(COLLECTION_NAME).insertOne(stageDoc);

//     client.close();

//     return NextResponse.json({
//       success: true,
//       insertedId: result.insertedId,
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { error: "Failed to save stage data" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
const DB_NAME = "startup_singham";
const COLLECTION_NAME = "stages";
1;
async function connectToDatabase() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  return { client, db };
}

export async function POST(request, { params }) {
  const { projectId } = params;

  try {
    const { client, db } = await connectToDatabase();
    const { stageNumber, parameters } = await request.json();

    // Check if stage already exists
    const existingStage = await db.collection(COLLECTION_NAME).findOne({
      projectId: new ObjectId(projectId),
      stageNumber,
    });

    if (existingStage) {
      client.close();
      return NextResponse.json(
        { error: "Parameters for this stage already submitted" },
        { status: 400 }
      );
    }

    // Create a new document with properly structured arrays
    const stageDoc = {
      projectId: new ObjectId(projectId),
      stageNumber,
      parameters: {},
      createdAt: new Date(),
    };

    // Ensure parameters are stored as simple arrays
    for (const [param, values] of Object.entries(parameters)) {
      stageDoc.parameters[param] = Array.isArray(values) ? values : [values];
    }

    const result = await db.collection(COLLECTION_NAME).insertOne(stageDoc);

    client.close();

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save stage data" },
      { status: 500 }
    );
  }
}
