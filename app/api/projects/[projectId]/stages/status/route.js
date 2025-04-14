import Project from "@/models/Project";
import Stage from "@/models/Stage";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB(); // First await the database connection
  const { projectId } = params; // Then destructure params

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
