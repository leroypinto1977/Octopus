// import Project from "@/models/Project";
// import connectDB from "@/lib/connectDB";
// import { NextResponse } from "next/server";

// export async function POST(req, { params }) {
//   try {
//     await connectDB();

//     // Get projectId from params
//     const { projectId } = params;

//     const { stageNumber, parameters } = await req.json();

//     // Validate stage number
//     if (![1, 2, 3, 4].includes(stageNumber)) {
//       return NextResponse.json(
//         { error: "Invalid stage number" },
//         { status: 400 }
//       );
//     }

//     // Update the project
//     const updatedProject = await Project.findOneAndUpdate(
//       { projectId: projectId }, // Query by projectId
//       {
//         $set: {
//           [`stages.stage${stageNumber}`]: {
//             parameters,
//             submittedAt: new Date(),
//           },
//         },
//       },
//       { new: true }
//     );

//     if (!updatedProject) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       {
//         message: "Stage data saved successfully",
//         project: updatedProject,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error saving stage data:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to save stage data",
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req, { params }) {
//   await connectDB();
//   const { projectId } = params;

//   try {
//     const project = await Project.findOne({ projectId });
//     if (!project) {
//       return NextResponse.json({ error: "Project not found" }, { status: 404 });
//     }

//     // Check which stages have been submitted
//     const status = {
//       stage1: !!project.stages.stage1,
//       stage2: !!project.stages.stage2,
//       stage3: !!project.stages.stage3,
//     };

//     return NextResponse.json(status);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to check stage status" },
//       { status: 500 }
//     );
//   }
// }

import Project from "@/models/Project";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { projectId } = params;
    const { stageNumber, parameters } = await req.json();

    const updatedProject = await Project.findOneAndUpdate(
      { projectId },
      {
        $set: {
          [`stages.stage${stageNumber}`]: {
            parameters,
            submittedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Stage data saved successfully",
        project: updatedProject,
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

export async function GET(req, { params }) {
  await connectDB();
  const { projectId } = params;

  try {
    const project = await Project.findOne({ projectId });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check which stages have been submitted
    const status = {
      stage1: !!project.stages.stage1,
      stage2: !!project.stages.stage2,
      stage3: !!project.stages.stage3,
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check stage status" },
      { status: 500 }
    );
  }
}
