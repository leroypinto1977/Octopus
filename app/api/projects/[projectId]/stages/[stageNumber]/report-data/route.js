// // app/api/reports/[projectId]/[stageNumber]/route.js
// import fs from "fs";
// import path from "path";
// import fetch from "node-fetch";
// import { parse } from "csv-parse/sync";
// import { NextResponse } from "next/server";

// export async function GET(request, { params }) {
//   const { projectId, stageNumber } = params;

//   // Validate input
//   if (!projectId || !stageNumber) {
//     return NextResponse.json(
//       { error: "Missing project ID or stage number" },
//       { status: 400 }
//     );
//   }

//   const fileName = `${projectId}-stage-${stageNumber}-report.csv`;
//   const reportsDir = path.join(process.cwd(), "reports");
//   const filePath = path.join(reportsDir, fileName);

//   try {
//     // Create reports directory if it doesn't exist
//     if (!fs.existsSync(reportsDir)) {
//       fs.mkdirSync(reportsDir, { recursive: true });
//     }

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       // Fetch CSV from n8n
//       const response = await fetch(
//         "https://leroyaxtr.app.n8n.cloud/webhook/0c7ef2fc-bd27-4499-9227-484c768fa7a6",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ projectId, stageNumber }),
//         }
//       );

//       if (!response.ok) throw new Error("Failed to fetch CSV");

//       const csvData = await response.text();
//       fs.writeFileSync(filePath, csvData);
//     }

//     // Read and parse CSV
//     const csvContent = fs.readFileSync(filePath, "utf8");
//     const records = parse(csvContent, {
//       columns: true,
//       skip_empty_lines: true,
//     });

//     return NextResponse.json(records);
//   } catch (error) {
//     console.error("Error processing report data:", error);
//     return NextResponse.json(
//       { error: "Failed to process report data" },
//       { status: 500 }
//     );
//   }
// }

// app/api/projects/[projectId]/stages/[stageNumber]/report-data/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { parse } from "csv-parse/sync";

export async function GET(request, { params }) {
  const { projectId, stageNumber } = params;

  // Validate input
  if (!projectId || !stageNumber) {
    return NextResponse.json(
      { error: "Missing project ID or stage number" },
      { status: 400 }
    );
  }

  const fileName = `${projectId}-stage-${stageNumber}-report.csv`;
  const reportsDir = path.join(process.cwd(), "reports");
  const filePath = path.join(reportsDir, fileName);

  try {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Fetch CSV from n8n
      const response = await fetch(
        "https://leroyaxtr.app.n8n.cloud/webhook/0c7ef2fc-bd27-4499-9227-484c768fa7a6",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, stageNumber }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch CSV");

      const csvData = await response.text();
      fs.writeFileSync(filePath, csvData);
    }

    // Read and parse CSV
    const csvContent = fs.readFileSync(filePath, "utf8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error processing report data:", error);
    return NextResponse.json(
      { error: "Failed to process report data" },
      { status: 500 }
    );
  }
}
