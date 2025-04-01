// app/api/projects/[projectId]/stats/route.ts
import { connectToDatabase } from "@/lib/db";
import csv from "csv-parser";
import { Readable } from "stream";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params; // Properly destructure params
    const { db } = await connectToDatabase();
    const project = await db.collection("projects").findOne({
      _id: projectId, // Use the destructured projectId
    });

    if (!project || !project.csvData) {
      return new Response(
        JSON.stringify({ message: "Project or CSV data not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process CSV data
    const results: any[] = [];
    const readable = Readable.from(project.csvData);

    await new Promise((resolve, reject) => {
      readable
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    // app/api/projects/[projectId]/stats/route.ts
    const cityCoordinates = {
      Chennai: { lat: 13.0827, lng: 80.2707 },
      Coimbatore: { lat: 11.0168, lng: 76.9558 },
      Erode: { lat: 11.3428, lng: 77.7274 },
      Kanyakumari: { lat: 8.0883, lng: 77.5385 },
      Madurai: { lat: 9.9252, lng: 78.1198 },
      Ooty: { lat: 11.41, lng: 76.6954 },
      Salem: { lat: 11.6643, lng: 78.146 },
      Trichy: { lat: 10.7905, lng: 78.7047 },
      Tirunelveli: { lat: 8.7139, lng: 77.7567 },
      Vellore: { lat: 12.9165, lng: 79.1325 },
    };

    // Inside the GET function after processing CSV results:
    const locations = results.map((entry: { [key: string]: string }) => ({
      name: entry["Company Name"],
      sector: entry.Sector,
      city: entry.City,
      ...(cityCoordinates[entry.City as keyof typeof cityCoordinates] || {
        lat: 0,
        lng: 0,
      }),
    }));

    const stageCounts = results.reduce((acc, entry) => {
      const stage = entry["Current Stage of Startup"];
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    const stageData = Object.entries(stageCounts).map(([name, value]) => ({
      name,
      value,
      fill: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }));

    // Update stats object to include:
    const stats = {
      // ... existing stats,
      totalEntries: results.length,
      columns: Object.keys(results[0] || {}),
      sampleData: results.slice(0, 5),
      locations,
      stageData,
      totalStartups: results.length,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing CSV data:", error);
    return new Response(
      JSON.stringify({ message: "Error processing CSV data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Add other HTTP methods if needed
export async function POST() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
