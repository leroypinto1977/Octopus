// import { NextResponse } from "next/server";
// import { MongoClient, ObjectId } from "mongodb";
// import { connectToDatabase } from "@/lib/db";

// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/startup_singham";
// const DB_NAME = "startup_singham";
// const COLLECTION_NAME = "stages";

// async function connectToDatabase() {
//   const client = await MongoClient.connect(MONGODB_URI);
//   const db = client.db(DB_NAME);
//   return { client, db };
// }

// export async function GET(request, { params }) {
//   const { projectId } = params;

//   try {
//     const { client, db } = await connectToDatabase();

//     const result = await db
//       .collection(COLLECTION_NAME)
//       .find({
//         projectId: new ObjectId(projectId),
//       })
//       .toArray();

//     client.close();

//     return NextResponse.json({
//       stage1: result.some((doc) => doc.stageNumber === 1),
//       stage2: result.some((doc) => doc.stageNumber === 2),
//       stage3: result.some((doc) => doc.stageNumber === 3),
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch submission status" },
//       { status: 500 }
//     );
//   }
// }

// import { connectToDatabase } from "@/lib/db";

// export async function GET(
//   request: Request,
//   { params }: { params: { projectId: string } }
// ) {
//   try {
//     const { projectId } = params; // Properly destructure params
//     const { db } = await connectToDatabase();

//     // Check if the project exists
//     const project = await db.collection("projects").findOne({
//       _id: projectId,
//     });

//     if (!project) {
//       return new Response(JSON.stringify({ message: "Project not found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Check stage submission status
//     const stageStatus = await db.collection("stageSubmissions").findOne({
//       projectId,
//     });

//     return new Response(
//       JSON.stringify(
//         stageStatus || {
//           stage1: false,
//           stage2: false,
//           stage3: false,
//         }
//       ),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("Error checking stage submission:", error);
//     return new Response(
//       JSON.stringify({ message: "Error checking stage submission" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

// import { connectToDatabase } from "@/lib/db";

// export async function GET(request, { params }) {
//   try {
//     // First await the params promise if needed
//     const awaitedParams = await Promise.resolve(params);
//     const { projectId } = awaitedParams;

//     const { db } = await connectToDatabase();

//     // Check if the project exists - using projectId from your schema
//     const project = await db.collection("projects").findOne({
//       projectId: projectId,
//     });

//     if (!project) {
//       return new Response(JSON.stringify({ message: "Project not found" }), {
//         status: 404,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     // Return the stages status from the project document
//     const stagesStatus = project.stages || {
//       stage1: false,
//       stage2: false,
//       stage3: false,
//       stage4: false,
//     };

//     return new Response(JSON.stringify(stagesStatus), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error checking stage submission:", error);
//     return new Response(
//       JSON.stringify({
//         message: "Error checking stage submission",
//         error: error.message,
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }

import Project from "@/models/Project";
import Stage from "@/models/Stage";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

// export async function GET(req, { params }) {
//   try {
//     await connectDB();

//     const { projectId } = params;

//     const project = await Project.findOne({ projectId });

//     if (!project) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     // Return the stages status
//     const status = {
//       stage1: !!project.stages?.stage1,
//       stage2: !!project.stages?.stage2,
//       stage3: !!project.stages?.stage3,
//       stage4: !!project.stages?.stage4,
//     };

//     return NextResponse.json(status);
//   } catch (error) {
//     console.error("Error checking stage status:", error);
//     return NextResponse.json(
//       { error: "Failed to check stage status" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req, { params }) {
  const { projectId } = params;

  await connectDB();

  try {
    const stages = await Stage.find({ projectId });
    const status = {
      stage1: false,
      stage2: false,
      stage3: false,
      stage4: false,
    };

    stages.forEach((stage) => {
      status[`stage${stage.stageNumber}`] =
        Object.keys(stage.parameters).length > 0;
    });

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check stage status" },
      { status: 500 }
    );
  }
}
