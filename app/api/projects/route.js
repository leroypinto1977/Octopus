// import Project from "@/models/Project";
// import connectDB from "@/lib/connectDB";
// import { NextResponse } from "next/server";

// function processCSVData(csvString) {
//   const lines = csvString.split("\n");
//   const headers = lines[0].split(",").map((h) => h.trim());
//   const result = [];

//   for (let i = 1; i < lines.length; i++) {
//     if (!lines[i].trim()) continue;

//     const currentLine = lines[i].split(",");
//     const obj = {};

//     for (let j = 0; j < headers.length; j++) {
//       obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : "";
//     }

//     result.push(obj);
//   }

//   // Process data for visualization
//   const cityDistribution = {};
//   const stageDistribution = {};
//   const sectorDistribution = {};

//   result.forEach((company) => {
//     // Count cities
//     const city = company.City;
//     cityDistribution[city] = (cityDistribution[city] || 0) + 1;

//     // Count stages
//     const stage = company["Current Stage of Startup"];
//     stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;

//     // Count sectors
//     const sector = company.Sector;
//     sectorDistribution[sector] = (sectorDistribution[sector] || 0) + 1;
//   });

//   return {
//     cityDistribution,
//     stageDistribution,
//     sectorDistribution,
//     totalStartups: result.length,
//   };
// }

// // Update the GET endpoint
// export async function GET(req) {
//   await connectDB();
//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get("userId");
//   const projectId = searchParams.get("projectId");
//   const analyticsData = searchParams.get("analyticsData");

//   try {
//     if (projectId && analyticsData) {
//       const project = await Project.findOne({ projectId });

//       if (!project) {
//         return NextResponse.json(
//           { error: "Project not found" },
//           { status: 404 }
//         );
//       }

//       if (!project.csvFileData) {
//         return NextResponse.json(
//           { error: "No CSV data found for this project" },
//           { status: 404 }
//         );
//       }

//       const csvString = project.csvFileData.toString("utf-8");
//       const processedData = processCSVData(csvString);

//       return NextResponse.json({
//         success: true,
//         data: processedData,
//       });
//     } else if (userId) {
//       const projects = await Project.find({ userId });
//       return NextResponse.json(projects);
//     } else {
//       return NextResponse.json(
//         { error: "Missing parameters" },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch data", details: error.message },
//       { status: 500 }
//     );
//   }
// }

// const generateUniqueProjectId = async () => {
//   let generatedId;
//   let isUnique = false;
//   let attempts = 0;
//   const maxAttempts = 5; // Prevent infinite loops

//   while (!isUnique && attempts < maxAttempts) {
//     attempts++;
//     generatedId = `PRJ_${Date.now()}_${Math.floor(
//       1000 + Math.random() * 9000
//     )}`;

//     try {
//       const existingProject = await Project.findOne({ projectId: generatedId });
//       if (!existingProject) {
//         isUnique = true;
//       }
//     } catch (error) {
//       console.error("Error checking project ID uniqueness:", error);
//       if (attempts >= maxAttempts) {
//         throw new Error(
//           "Failed to verify project ID uniqueness after multiple attempts"
//         );
//       }
//     }
//   }

//   if (!isUnique) {
//     throw new Error("Failed to generate unique project ID");
//   }

//   return generatedId;
// };

// export async function POST(req) {
//   try {
//     await connectDB();

//     const formData = await req.formData();
//     const userId = formData.get("userId");
//     const name = formData.get("name");
//     const formUrl = formData.get("formUrl");
//     const csvFile = formData.get("csvFile");

//     // Generate unique project ID
//     const projectId = await generateUniqueProjectId();

//     // Handle file upload if exists
//     let csvFileName = null;
//     let csvFileData = null;

//     if (csvFile) {
//       if (csvFile.size > 5 * 1024 * 1024) {
//         return NextResponse.json(
//           { error: "File size exceeds 5MB limit" },
//           { status: 400 }
//         );
//       }
//       csvFileName = csvFile.name;
//       csvFileData = Buffer.from(await csvFile.arrayBuffer());
//     }

//     // Create new project
//     const project = new Project({
//       projectId,
//       userId,
//       name,
//       ...(formUrl && { formUrl }),
//       ...(csvFileName && { csvFileName }),
//       ...(csvFileData && { csvFileData }),
//     });

//     await project.save();

//     return NextResponse.json(project, { status: 201 });
//   } catch (error) {
//     console.error("Error creating project:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to create project",
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

import Project from "@/models/Project";
import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";

function processCSVData(csvString) {
  const lines = csvString.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const currentLine = lines[i].split(",");
    const obj = {};

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : "";
    }

    result.push(obj);
  }

  // Add legal entity distribution processing
  const legalEntityDistribution = {};
  const cityDistribution = {};
  const stageDistribution = {};
  const sectorDistribution = {};

  result.forEach((company) => {
    // Count legal entities
    const legalEntity = company["Legal Entity"];
    legalEntityDistribution[legalEntity] =
      (legalEntityDistribution[legalEntity] || 0) + 1;

    // Existing counts
    const city = company.City;
    cityDistribution[city] = (cityDistribution[city] || 0) + 1;

    const stage = company["Current Stage of Startup"];
    stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;

    const sector = company.Sector;
    sectorDistribution[sector] = (sectorDistribution[sector] || 0) + 1;
  });

  return {
    legalEntityDistribution,
    cityDistribution,
    stageDistribution,
    sectorDistribution,
    totalStartups: result.length,
  };
}

// Update the GET endpoint
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");
  const analyticsData = searchParams.get("analyticsData");

  try {
    if (projectId && analyticsData) {
      const project = await Project.findOne({ projectId });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (!project.csvFileData) {
        return NextResponse.json(
          { error: "No CSV data found for this project" },
          { status: 404 }
        );
      }

      const csvString = project.csvFileData.toString("utf-8");
      const processedData = processCSVData(csvString);

      return NextResponse.json({
        success: true,
        data: processedData,
      });
    } else if (userId) {
      const projects = await Project.find({ userId });
      return NextResponse.json(projects);
    } else {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message },
      { status: 500 }
    );
  }
}

const generateUniqueProjectId = async () => {
  let generatedId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5; // Prevent infinite loops

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    generatedId = `PRJ_${Date.now()}_${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    try {
      const existingProject = await Project.findOne({ projectId: generatedId });
      if (!existingProject) {
        isUnique = true;
      }
    } catch (error) {
      console.error("Error checking project ID uniqueness:", error);
      if (attempts >= maxAttempts) {
        throw new Error(
          "Failed to verify project ID uniqueness after multiple attempts"
        );
      }
    }
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique project ID");
  }

  return generatedId;
};

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const userId = formData.get("userId");
    const name = formData.get("name");
    const formUrl = formData.get("formUrl");
    const csvFile = formData.get("csvFile");

    // Generate unique project ID
    const projectId = await generateUniqueProjectId();

    // Handle file upload if exists
    let csvFileName = null;
    let csvFileData = null;

    if (csvFile) {
      if (csvFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit" },
          { status: 400 }
        );
      }
      csvFileName = csvFile.name;
      csvFileData = Buffer.from(await csvFile.arrayBuffer());
    }

    // Create new project
    const project = new Project({
      projectId,
      userId,
      name,
      ...(formUrl && { formUrl }),
      ...(csvFileName && { csvFileName }),
      ...(csvFileData && { csvFileData }),
    });

    await project.save();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
