// import Stage from "@/models/Stage";
// import connectDB from "@/lib/connectDB";
// import { NextResponse } from "next/server";

// export async function POST(req, { params }) {
//   try {
//     await connectDB();
//     const { projectId } = params;
//     const { stageNumber, parameters } = await req.json();

//     // Convert parameters to Map format
//     const parametersMap = {};
//     Object.entries(parameters).forEach(([key, values]) => {
//       parametersMap[key] = Array.isArray(values) ? values : [values];
//     });

//     // Update or create the stage document
//     const updatedStage = await Stage.findOneAndUpdate(
//       { projectId, stageNumber },
//       {
//         $setOnInsert: { projectId, stageNumber },
//         $push: Object.entries(parametersMap).reduce((acc, [key, values]) => {
//           values.forEach((value) => {
//             acc[`parameters.${key}`] = value;
//           });
//           return acc;
//         }, {}),
//       },
//       { upsert: true, new: true }
//     );

//     return NextResponse.json(
//       {
//         message: "Stage data saved successfully",
//         stage: updatedStage,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error saving stage data:", error);
//     return NextResponse.json(
//       { error: "Failed to save stage data" },
//       { status: 500 }
//     );
//   }
// }

import Stage from "@/models/Stage";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  // Destructure params FIRST before any async operations
  const { projectId } = params;

  try {
    await connectDB();
    const { stageNumber, parameters } = await req.json();

    // Convert parameters to proper array format
    const updateObject = {};
    Object.entries(parameters).forEach(([key, values]) => {
      updateObject[key] = Array.isArray(values) ? values : [values];
    });

    // Build MongoDB update operation
    const updateOperation = {
      $setOnInsert: { projectId, stageNumber },
      $push: {},
    };

    // Add $push operations for each parameter
    Object.entries(updateObject).forEach(([key, values]) => {
      updateOperation.$push[`parameters.${key}`] = {
        $each: values,
      };
    });

    // Update or create the stage document
    const updatedStage = await Stage.findOneAndUpdate(
      { projectId, stageNumber },
      updateOperation,
      {
        upsert: true,
        new: true,
        // Remove arrayFilters since we're not using them
      }
    );

    return NextResponse.json(
      {
        message: "Stage data saved successfully",
        stage: updatedStage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving stage data:", error);
    return NextResponse.json(
      { error: "Failed to save stage data" },
      { status: 500 }
    );
  }
}

// app/api/projects/[projectId]/stages/route.js
export async function GET(req, { params }) {
  await connectDB();
  const { projectId } = params;

  try {
    const stages = await Stage.find({ projectId });
    const status = {
      stage1: false,
      stage2: false,
      stage3: false,
      stage4: false,
    };

    stages.forEach((stage) => {
      // Correct parameter existence check
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
