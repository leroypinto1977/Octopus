// app/api/projects/[projectId]/stages/[stageNumber]/route.js
import Stage from "@/models/Stage";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { projectId, stageNumber } = params;

  await connectDB();

  try {
    const { status, progress } = await request.json();

    const updatedStage = await Stage.findOneAndUpdate(
      { projectId, stageNumber: parseInt(stageNumber) },
      { status, progress },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedStage, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update stage status" },
      { status: 500 }
    );
  }
}

// This defines which HTTP methods are allowed for this route
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "PUT",
    },
  });
}
