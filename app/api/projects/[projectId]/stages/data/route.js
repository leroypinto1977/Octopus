import Stage from "@/models/Stage";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB(); // First await the database connection
  const { projectId } = params; // Then destructure params

  try {
    const stages = await Stage.find({ projectId });
    return NextResponse.json(stages);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stages data" },
      { status: 500 }
    );
  }
}
