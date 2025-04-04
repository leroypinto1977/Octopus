// "use client";
// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal, Play, Plus } from "lucide-react";

// // Mock user ID for demonstration - in a real app, this would come from authentication
// const USER_ID = "leroy";

// export default function Home() {
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formUrl, setFormUrl] = useState("");

//   // New project form state
//   const [projectName, setProjectName] = useState("");
//   const [csvFile, setCsvFile] = useState(null);

//   // Stage status tracking
//   const [stageStatus, setStageStatus] = useState({
//     stage1: { status: "not_started", progress: 0 },
//     stage2: { status: "not_started", progress: 0 },
//     stage3: { status: "not_started", progress: 0 },
//     stage4: { status: "not_started", progress: 0 },
//   });

//   // Form state for dynamic input fields for each stage
//   const [stageForms, setStageForms] = useState({
//     stage1: [{ parameter: "", value: "" }],
//     stage2: [{ parameter: "", value: "" }],
//     stage3: [{ parameter: "", value: "" }],
//   });

//   // Track form submission status for each stage
//   const [isFormSubmitted, setIsFormSubmitted] = useState({
//     stage1: false,
//     stage2: false,
//     stage3: false,
//   });

//   // Fetch projects from MongoDB
//   const fetchProjects = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/projects?userId=${USER_ID}`);
//       if (response.ok) {
//         const data = await response.json();
//         setProjects(data);
//       } else {
//         console.error("Failed to fetch projects");
//       }
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Load projects on component mount
//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const handleCreateProject = async () => {
//     if (!projectName.trim() || !csvFile) {
//       alert("Please provide a project name and CSV file");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("userId", USER_ID);
//     formData.append("name", projectName);
//     formData.append("formUrl", formUrl); // Add this line
//     formData.append("csvFile", csvFile);

//     try {
//       const response = await fetch("/api/projects", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         fetchProjects();
//         setProjectName("");
//         setFormUrl(""); // Reset form URL
//         setCsvFile(null);
//         setIsModalOpen(false);
//       }
//     } catch (error) {
//       console.error("Error creating project:", error);
//     }
//   };

//   // Delete project
//   const handleDeleteProject = async (projectId) => {
//     if (window.confirm("Are you sure you want to delete this project?")) {
//       try {
//         const response = await fetch(`/api/projects/${projectId}`, {
//           method: "DELETE",
//         });

//         if (response.ok) {
//           // If the deleted project was selected, clear selection
//           if (selectedProject?._id === projectId) {
//             setSelectedProject(null);
//           }
//           // Refresh projects list
//           fetchProjects();
//         } else {
//           alert("Failed to delete project");
//         }
//       } catch (error) {
//         console.error("Error deleting project:", error);
//         alert("Error deleting project");
//       }
//     }
//   };

//   // Export project
//   const handleExportProject = async (projectId) => {
//     try {
//       const response = await fetch(`/api/projects/${projectId}/export`);

//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `project-${projectId}.csv`;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         a.remove();
//       } else {
//         alert("Failed to export project");
//       }
//     } catch (error) {
//       console.error("Error exporting project:", error);
//       alert("Error exporting project");
//     }
//   };

//   // Handle adding new input fields for a specific stage
//   const handleAddFields = (stageNumber) => {
//     const stageName = `stage${stageNumber}`;
//     setStageForms((prev) => ({
//       ...prev,
//       [stageName]: [...prev[stageName], { parameter: "", value: "" }],
//     }));
//   };

//   // Handle input change for a specific stage
//   const handleInputChange = (stageNumber, index, field, value) => {
//     const stageName = `stage${stageNumber}`;
//     const newFormFields = [...stageForms[stageName]];
//     newFormFields[index][field] = value;
//     setStageForms((prev) => ({
//       ...prev,
//       [stageName]: newFormFields,
//     }));
//   };

//   const handleSubmit = async (stageNumber) => {
//     if (!selectedProject) {
//       alert("No project selected");
//       return;
//     }

//     const stageName = `stage${stageNumber}`;
//     const parameters = {};

//     // Flatten the parameter values
//     stageForms[stageName].forEach((field) => {
//       if (field.parameter && field.value) {
//         if (!parameters[field.parameter]) {
//           parameters[field.parameter] = [];
//         }
//         // Directly push the value instead of creating nested arrays
//         parameters[field.parameter].push(field.value);
//       }
//     });

//     try {
//       const response = await fetch(
//         `/api/projects/${selectedProject._id}/stages`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             projectId: selectedProject._id,
//             stageNumber,
//             parameters,
//           }),
//         }
//       );

//       if (response.ok) {
//         setIsFormSubmitted((prev) => ({
//           ...prev,
//           [stageName]: true,
//         }));
//         setStageForms((prev) => ({
//           ...prev,
//           [stageName]: [{ parameter: "", value: "" }],
//         }));
//       }
//     } catch (error) {
//       console.error("Error saving stage data:", error);
//     }
//   };

//   // Check if a stage button should be disabled
//   const isStageButtonDisabled = (stageNumber) => {
//     if (stageNumber === 1) return false; // First stage is always enabled

//     // Check if the previous stage is completed
//     const prevStageName = `stage${stageNumber - 1}`;
//     return stageStatus[prevStageName].status !== "completed";
//   };

//   // Add this useEffect to load submission status when project is selected
//   useEffect(() => {
//     const checkStageSubmission = async () => {
//       if (selectedProject) {
//         try {
//           const response = await fetch(
//             `/api/projects/${selectedProject._id}/stages/status`
//           );
//           if (response.ok) {
//             const status = await response.json();
//             setIsFormSubmitted(status);
//           }
//         } catch (error) {
//           console.error("Error checking stage submission:", error);
//         }
//       }
//     };
//     checkStageSubmission();
//   }, [selectedProject]);

//   // Modify the renderStageContent function
//   const renderStageContent = (stageNumber, title, description, tasks) => {
//     const stageName = `stage${stageNumber}`;
//     const status = stageStatus[stageName].status;
//     const progress = stageStatus[stageName].progress;

//     const isSubmitted = isFormSubmitted[stageName];

//     if (status === "processing") {
//       return (
//         <div className="flex flex-col items-center justify-center h-64">
//           <h3 className="text-xl font-semibold mb-4">
//             Processing Stage {stageNumber}
//           </h3>
//           <div className="w-full max-w-md h-4 bg-gray-200 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
//               style={{ width: `${progress}%` }}
//             ></div>
//           </div>
//           <p className="mt-2 text-gray-600">{progress}% Complete</p>
//         </div>
//       );
//     } else if (status === "completed") {
//       return (
//         <div>
//           <p>{description}</p>
//           <div className="mt-4 space-y-4">
//             {tasks.map((task, idx) => (
//               <div
//                 key={idx}
//                 className="p-3 bg-green-50 rounded-md border border-green-200"
//               >
//                 <h3 className="font-medium">{task.title}</h3>
//                 <p className="text-gray-600 text-sm">{task.description}</p>
//                 <div className="mt-2">
//                   <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
//                     Completed
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     } else {
//       return (
//         <div>
//           <p>{description}</p>
//           {stageNumber !== 4 && !isSubmitted ? (
//             <div className="mt-4">
//               <div className="space-y-4">
//                 {stageForms[stageName].map((field, index) => (
//                   <div key={index} className="flex gap-4">
//                     <Input
//                       placeholder="Parameter"
//                       value={field.parameter}
//                       onChange={(e) =>
//                         handleInputChange(
//                           stageNumber,
//                           index,
//                           "parameter",
//                           e.target.value
//                         )
//                       }
//                     />
//                     <Input
//                       placeholder="Value"
//                       value={field.value}
//                       onChange={(e) =>
//                         handleInputChange(
//                           stageNumber,
//                           index,
//                           "value",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex gap-2 mt-4">
//                 <Button
//                   onClick={() => handleAddFields(stageNumber)}
//                   variant="outline"
//                   className="w-10 h-10 p-0"
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//                 <Button onClick={() => handleSubmit(stageNumber)}>
//                   Submit
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <div className="mt-4 space-y-4">
//               {tasks.map((task, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 bg-gray-100 rounded-md border border-gray-200"
//                 >
//                   <h3 className="font-medium">{task.title}</h3>
//                   <p className="text-gray-600 text-sm">{task.description}</p>
//                 </div>
//               ))}
//               <div className="flex justify-center mt-8">
//                 <Button
//                   onClick={() => handleStartStage(stageNumber)}
//                   disabled={isStageButtonDisabled(stageNumber)}
//                   className="flex items-center gap-2"
//                 >
//                   <Play className="h-4 w-4" />
//                   Start Stage
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       {/* Navbar */}
//       <nav className="border-b-2 border-gray-300 bg-black text-white px-6 py-4 flex justify-between items-center">
//         <div className="text-xl font-bold">StartupSingham</div>
//         <Button
//           onClick={() => setIsModalOpen(true)}
//           variant="outline"
//           className="text-black border-white hover:bg-neutral-900 hover:text-white"
//         >
//           New Project
//         </Button>
//       </nav>

//       {/* Main Content - Fill the entire screen */}
//       <div className="flex flex-1 p-4 gap-6 h-full">
//         {/* Projects List - Left Panel */}
//         <Card
//           className="w-1/4 border-2 border-gray-300 overflow-hidden"
//           style={{
//             background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
//           }}
//         >
//           <CardHeader className="border-b border-gray-200">
//             <CardTitle>Projects List</CardTitle>
//           </CardHeader>
//           <CardContent className="p-4">
//             {isLoading ? (
//               <div className="py-4 text-center">Loading projects...</div>
//             ) : projects.length === 0 ? (
//               <div className="py-4 text-center text-gray-500">
//                 No projects found. Create a new project to get started.
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {projects.map((project) => (
//                   <div
//                     key={project._id}
//                     className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
//                       selectedProject?._id === project._id
//                         ? "bg-black text-white"
//                         : "bg-gray-100 hover:bg-gray-200"
//                     }`}
//                   >
//                     <div
//                       className="flex-1"
//                       onClick={() => {
//                         setSelectedProject(project);
//                         // Reset stage status when selecting a new project
//                         setStageStatus({
//                           stage1: { status: "not_started", progress: 0 },
//                           stage2: { status: "not_started", progress: 0 },
//                           stage3: { status: "not_started", progress: 0 },
//                           stage4: { status: "not_started", progress: 0 },
//                         });
//                       }}
//                     >
//                       {project.name}
//                     </div>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className={`p-0 h-8 w-8 rounded-full ${
//                             selectedProject?._id === project._id
//                               ? "text-white hover:bg-neutral-400"
//                               : "text-neutral-300 hover:bg-neutral-600"
//                           }`}
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem
//                           onClick={() => handleExportProject(project._id)}
//                         >
//                           Export Project
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           className="text-red-600"
//                           onClick={() => handleDeleteProject(project._id)}
//                         >
//                           Delete Project
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Project Details - Right Panel */}
//         <Card
//           className="w-3/4 rounded-xl border-2 border-gray-300 overflow-hidden"
//           style={{
//             background: "linear-gradient(to bottom, #ffffff, #f5f5f5)",
//           }}
//         >
//           <CardContent className="p-6 h-full">
//             {selectedProject ? (
//               <div className="h-full flex flex-col">
//                 <h2 className="text-2xl font-bold mb-6">
//                   {selectedProject.name}
//                 </h2>
//                 {/* Project Stage Tabs */}
//                 <Tabs defaultValue="stage1" className="flex-1 flex flex-col">
//                   <TabsList className="grid w-full grid-cols-4 mb-6">
//                     <TabsTrigger value="stage1">Stage 1</TabsTrigger>
//                     <TabsTrigger value="stage2">Stage 2</TabsTrigger>
//                     <TabsTrigger value="stage3">Stage 3</TabsTrigger>
//                     <TabsTrigger value="stage4">Stage 4</TabsTrigger>
//                   </TabsList>
//                   <TabsContent value="stage1" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 1: Planning</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           1,
//                           "Planning",
//                           `Initial planning and requirement gathering for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Requirements Document",
//                               description:
//                                 "Complete the detailed requirements specification.",
//                             },
//                             {
//                               title: "Project Timeline",
//                               description:
//                                 "Establish milestones and delivery schedule.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                   <TabsContent value="stage2" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 2: Development</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           2,
//                           "Development",
//                           `Active development phase for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Frontend Implementation",
//                               description:
//                                 "User interface development based on approved designs.",
//                             },
//                             {
//                               title: "Backend Services",
//                               description:
//                                 "API development and database integration.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                   <TabsContent value="stage3" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 3: Deployment</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           3,
//                           "Deployment",
//                           `Final testing and deployment phase for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Quality Assurance",
//                               description:
//                                 "Final testing and bug fixes before launch.",
//                             },
//                             {
//                               title: "Production Deployment",
//                               description:
//                                 "Live deployment and monitoring setup.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                   <TabsContent value="stage4" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 4: Maintenance</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           4,
//                           "Maintenance",
//                           `Ongoing maintenance and support for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Performance Monitoring",
//                               description:
//                                 "Track system performance and identify optimizations.",
//                             },
//                             {
//                               title: "Feature Updates",
//                               description:
//                                 "Implement new features and enhancements based on feedback.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">
//                 <p className="text-xl">Choose A Project</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* New Project Modal */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create New Project</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-2">
//             <div className="space-y-2">
//               <Label htmlFor="project-name">Project Name</Label>
//               <Input
//                 id="project-name"
//                 placeholder="Enter project name"
//                 value={projectName}
//                 onChange={(e) => setProjectName(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="form-url">Form URL</Label>
//               <Input
//                 id="form-url"
//                 placeholder="Enter form URL"
//                 value={formUrl}
//                 onChange={(e) => setFormUrl(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="csv-file">Upload CSV File</Label>
//               <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8">
//                 <Input
//                   id="csv-file"
//                   type="file"
//                   accept=".csv"
//                   onChange={(e) => setCsvFile(e.target.files[0])}
//                   className="hidden"
//                 />
//                 <label
//                   htmlFor="csv-file"
//                   className="flex flex-col items-center cursor-pointer"
//                 >
//                   <div className="text-sm text-gray-500 mb-2">
//                     {csvFile
//                       ? csvFile.name
//                       : "Click to upload or drag and drop"}
//                   </div>
//                   {/* <Button type="button" variant="outline" size="sm">
//                     Select CSV File
//                   </Button> */}
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => document.getElementById("csv-file").click()}
//                   >
//                     Select CSV File
//                   </Button>
//                 </label>
//               </div>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setIsModalOpen(false)} variant="outline">
//               Cancel
//             </Button>
//             <Button onClick={handleCreateProject}>Create Project</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Plus } from "lucide-react";

// Mock user ID for demonstration - in a real app, this would come from authentication
const USER_ID = "leroy";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");

  // New project form state
  const [projectName, setProjectName] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Stage status tracking
  const [stageStatus, setStageStatus] = useState({
    stage1: { status: "not_started", progress: 0 },
    stage2: { status: "not_started", progress: 0 },
    stage3: { status: "not_started", progress: 0 },
    stage4: { status: "not_started", progress: 0 },
  });

  // Form state for dynamic input fields for each stage
  const [stageForms, setStageForms] = useState({
    stage1: [{ parameter: "", value: "" }],
    stage2: [{ parameter: "", value: "" }],
    stage3: [{ parameter: "", value: "" }],
  });

  // Track form submission status for each stage
  const [isFormSubmitted, setIsFormSubmitted] = useState({
    stage1: false,
    stage2: false,
    stage3: false,
  });

  function getColorForStage(stage) {
    const colors = {
      Ideation: "#3b82f6",
      "Pre-Revenue": "#10b981",
      Prototype: "#f59e0b",
      "Revenue & Growth": "#6366f1",
      Expansion: "#8b5cf6",
      "Mature Business": "#ec4899",
      Validation: "#14b8a6",
      "Early Growth": "#f97316",
      Scaling: "#7c3aed",
    };
    return colors[stage] || "#6b7280";
  }

  // Fetch projects from MongoDB
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects?userId=${USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!projectName.trim() || !csvFile) {
      alert("Please provide a project name and CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("userId", USER_ID);
    formData.append("name", projectName);
    formData.append("formUrl", formUrl);
    formData.append("csvFile", csvFile);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header for FormData
      });

      if (response.ok) {
        const newProject = await response.json();
        fetchProjects();
        setProjectName("");
        setFormUrl("");
        setCsvFile(null);
        setIsModalOpen(false);
        setSelectedProject(newProject); // Select the newly created project
      }

      console.log(await response.json());
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Delete project
  // Example for delete project
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          if (selectedProject?.projectId === projectId) {
            setSelectedProject(null);
          }
          fetchProjects();
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  // Export project
  const handleExportProject = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project-${projectId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert("Failed to export project");
      }
    } catch (error) {
      console.error("Error exporting project:", error);
      alert("Error exporting project");
    }
  };

  // Handle adding new input fields for a specific stage
  const handleAddFields = (stageNumber) => {
    const stageName = `stage${stageNumber}`;
    setStageForms((prev) => ({
      ...prev,
      [stageName]: [...prev[stageName], { parameter: "", value: "" }],
    }));
  };

  // Handle input change for a specific stage
  const handleInputChange = (stageNumber, index, field, value) => {
    const stageName = `stage${stageNumber}`;
    const newFormFields = [...stageForms[stageName]];
    newFormFields[index][field] = value;
    setStageForms((prev) => ({
      ...prev,
      [stageName]: newFormFields,
    }));
  };

  // const handleSubmit = async (stageNumber) => {
  //   if (!selectedProject) {
  //     alert("No project selected");
  //     return;
  //   }

  //   const stageName = `stage${stageNumber}`;
  //   const parameters = {};

  //   // Flatten the parameter values
  //   stageForms[stageName].forEach((field) => {
  //     if (field.parameter && field.value) {
  //       if (!parameters[field.parameter]) {
  //         parameters[field.parameter] = [];
  //       }
  //       parameters[field.parameter].push(field.value);
  //     }
  //   });

  //   try {
  //     const response = await fetch(
  //       `/api/projects/${selectedProject.projectId}/stages`, // Changed from _id to projectId
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           projectId: selectedProject.projectId, // Changed from _id to projectId
  //           stageNumber,
  //           parameters,
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       setIsFormSubmitted((prev) => ({
  //         ...prev,
  //         [stageName]: true,
  //       }));
  //       setStageForms((prev) => ({
  //         ...prev,
  //         [stageName]: [{ parameter: "", value: "" }],
  //       }));

  //       // Refresh stage status after successful submission
  //       const statusResponse = await fetch(
  //         `/api/projects/${selectedProject.projectId}/stages/status`
  //       );
  //       if (statusResponse.ok) {
  //         const status = await statusResponse.json();
  //         setIsFormSubmitted(status);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error saving stage data:", error);
  //   }
  // };

  const handleSubmit = async (stageNumber) => {
    if (!selectedProject) {
      alert("No project selected");
      return;
    }

    const stageName = `stage${stageNumber}`;
    const parameters = {};

    // Flatten the parameter values
    stageForms[stageName].forEach((field) => {
      if (field.parameter && field.value) {
        if (!parameters[field.parameter]) {
          parameters[field.parameter] = [];
        }
        parameters[field.parameter].push(field.value);
      }
    });

    try {
      const response = await fetch(
        `/api/projects/${selectedProject.projectId}/stages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: selectedProject.projectId,
            stageNumber,
            parameters,
          }),
        }
      );

      if (response.ok) {
        // Update local state with project-specific stage data
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project.projectId === selectedProject.projectId
              ? {
                  ...project,
                  stages: {
                    ...project.stages,
                    [stageName]: {
                      parameters,
                      submittedAt: new Date().toISOString(),
                    },
                  },
                }
              : project
          )
        );

        setIsFormSubmitted((prev) => ({
          ...prev,
          [stageName]: true,
        }));
        setStageForms((prev) => ({
          ...prev,
          [stageName]: [{ parameter: "", value: "" }],
        }));
      }
    } catch (error) {
      console.error("Error saving stage data:", error);
    }
  };

  // Check if a stage button should be disabled
  const isStageButtonDisabled = (stageNumber) => {
    if (stageNumber === 1) return false; // First stage is always enabled

    // Check if the previous stage is completed
    const prevStageName = `stage${stageNumber - 1}`;
    return stageStatus[prevStageName].status !== "completed";
  };

  // Add this useEffect to load submission status when project is selected
  // useEffect(() => {
  //   const checkStageSubmission = async () => {
  //     if (selectedProject) {
  //       try {
  //         const response = await fetch(
  //           `/api/projects/${selectedProject._id}/stages/status`
  //         );
  //         if (response.ok) {
  //           const status = await response.json();
  //           setIsFormSubmitted(status);
  //         }
  //       } catch (error) {
  //         console.error("Error checking stage submission:", error);
  //       }
  //     }
  //   };
  //   checkStageSubmission();

  // }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      fetchAnalyticsData(selectedProject.projectId);
    }
  }, [selectedProject]);

  const fetchAnalyticsData = async (projectId) => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch(
        `/api/projects?projectId=${projectId}&analyticsData=true`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    const checkStageSubmission = async () => {
      if (selectedProject) {
        try {
          const response = await fetch(
            `/api/projects/${selectedProject.projectId}/stages/status`
          );
          if (response.ok) {
            const status = await response.json();
            setIsFormSubmitted(status);

            // Also load the existing parameters for the selected project
            const projectResponse = await fetch(
              `/api/projects/${selectedProject.projectId}`
            );
            if (projectResponse.ok) {
              const projectData = await projectResponse.json();
              if (projectData.stages) {
                // Update the projects state with the fetched data
                setProjects((prevProjects) =>
                  prevProjects.map((project) =>
                    project.projectId === selectedProject.projectId
                      ? { ...project, stages: projectData.stages }
                      : project
                  )
                );
              }
            }
          }
        } catch (error) {
          console.error("Error checking stage submission:", error);
        }
      }
    };
    checkStageSubmission();
  }, [selectedProject]);

  // const renderStageContent = (stageNumber, title, description, tasks) => {
  //   const stageName = `stage${stageNumber}`;
  //   const status = stageStatus[stageName].status;
  //   const progress = stageStatus[stageName].progress;

  //   const isSubmitted = isFormSubmitted[stageName];

  //   // Get the current project's stage data
  //   const currentProject = projects.find(
  //     (p) => p.projectId === selectedProject?.projectId
  //   );
  //   const stageData = currentProject?.stages?.[stageName];

  //   if (status === "processing") {
  //     return (
  //       <div className="flex flex-col items-center justify-center h-64">
  //         <h3 className="text-xl font-semibold mb-4">
  //           Processing Stage {stageNumber}
  //         </h3>
  //         <div className="w-full max-w-md h-4 bg-gray-200 rounded-full overflow-hidden">
  //           <div
  //             className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
  //             style={{ width: `${progress}%` }}
  //           ></div>
  //         </div>
  //         <p className="mt-2 text-gray-600">{progress}% Complete</p>
  //       </div>
  //     );
  //   } else if (status === "completed") {
  //     return (
  //       <div>
  //         <p>{description}</p>
  //         <div className="mt-4 space-y-4">
  //           {tasks.map((task, idx) => (
  //             <div
  //               key={idx}
  //               className="p-3 bg-green-50 rounded-md border border-green-200"
  //             >
  //               <h3 className="font-medium">{task.title}</h3>
  //               <p className="text-gray-600 text-sm">{task.description}</p>
  //               <div className="mt-2">
  //                 <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
  //                   Completed
  //                 </span>
  //               </div>
  //               {/* Show project-specific parameters */}
  //               {stageData?.parameters &&
  //                 Object.entries(stageData.parameters).map(
  //                   ([param, values]) => (
  //                     <div key={param} className="mt-2">
  //                       <p className="font-medium">{param}:</p>
  //                       <ul className="list-disc pl-5">
  //                         {values.map((value, i) => (
  //                           <li key={i}>{value}</li>
  //                         ))}
  //                       </ul>
  //                     </div>
  //                   )
  //                 )}
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     );
  //   } else {
  //     return (
  //       <div>
  //         <p>{description}</p>
  //         {stageNumber !== 4 && !isSubmitted ? (
  //           <div className="mt-4">
  //             <div className="space-y-4">
  //               {stageForms[stageName].map((field, index) => (
  //                 <div key={index} className="flex gap-4">
  //                   <Input
  //                     placeholder="Parameter"
  //                     value={field.parameter}
  //                     onChange={(e) =>
  //                       handleInputChange(
  //                         stageNumber,
  //                         index,
  //                         "parameter",
  //                         e.target.value
  //                       )
  //                     }
  //                   />
  //                   <Input
  //                     placeholder="Value"
  //                     value={field.value}
  //                     onChange={(e) =>
  //                       handleInputChange(
  //                         stageNumber,
  //                         index,
  //                         "value",
  //                         e.target.value
  //                       )
  //                     }
  //                   />
  //                 </div>
  //               ))}
  //             </div>
  //             <div className="flex gap-2 mt-4">
  //               <Button
  //                 onClick={() => handleAddFields(stageNumber)}
  //                 variant="outline"
  //                 className="w-10 h-10 p-0"
  //               >
  //                 <Plus className="h-4 w-4" />
  //               </Button>
  //               <Button onClick={() => handleSubmit(stageNumber)}>
  //                 Submit
  //               </Button>
  //             </div>
  //           </div>
  //         ) : (
  //           <div className="mt-4 space-y-4">
  //             {tasks.map((task, idx) => (
  //               <div
  //                 key={idx}
  //                 className="p-3 bg-gray-100 rounded-md border border-gray-200"
  //               >
  //                 <h3 className="font-medium">{task.title}</h3>
  //                 <p className="text-gray-600 text-sm">{task.description}</p>
  //                 {/* Show project-specific parameters if submitted */}
  //                 {isSubmitted && stageData?.parameters && (
  //                   <div className="mt-2">
  //                     {Object.entries(stageData.parameters).map(
  //                       ([param, values]) => (
  //                         <div key={param}>
  //                           <p className="font-medium">{param}:</p>
  //                           <ul className="list-disc pl-5">
  //                             {values.map((value, i) => (
  //                               <li key={i}>{value}</li>
  //                             ))}
  //                           </ul>
  //                         </div>
  //                       )
  //                     )}
  //                   </div>
  //                 )}
  //               </div>
  //             ))}
  //             <div className="flex justify-center mt-8">
  //               <Button
  //                 onClick={() => handleStartStage(stageNumber)}
  //                 disabled={isStageButtonDisabled(stageNumber)}
  //                 className="flex items-center gap-2"
  //               >
  //                 <Play className="h-4 w-4" />
  //                 Start Stage
  //               </Button>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     );
  //   }
  // };

  const renderStageContent = (stageNumber, title, description, tasks) => {
    const stageName = `stage${stageNumber}`;
    const status = stageStatus[stageName].status;
    const progress = stageStatus[stageName].progress;

    const isSubmitted = isFormSubmitted[stageName];

    // Get the current project's stage data
    const currentProject = projects.find(
      (p) => p.projectId === selectedProject?.projectId
    );
    const stageData = currentProject?.stages?.[stageName];
    const hasParameters =
      stageData?.parameters && Object.keys(stageData.parameters).length > 0;

    if (status === "processing") {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <h3 className="text-xl font-semibold mb-4">
            Processing Stage {stageNumber}
          </h3>
          <div className="w-full max-w-md h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">{progress}% Complete</p>
        </div>
      );
    } else if (status === "completed") {
      return (
        <div>
          <p>{description}</p>
          <div className="mt-4 space-y-4">
            {/* Stage Parameters Section - Added above tasks */}
            {hasParameters && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800">Stage Parameters</h3>
                <div className="mt-2 space-y-2">
                  {Object.entries(stageData.parameters).map(
                    ([param, values]) => (
                      <div key={param} className="ml-2">
                        <p className="font-medium">{param}:</p>
                        <ul className="list-disc pl-5">
                          {values.map((value, i) => (
                            <li key={i}>{value}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Tasks List */}
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="p-3 bg-green-50 rounded-md border border-green-200"
              >
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-gray-600 text-sm">{task.description}</p>
                <div className="mt-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <p>{description}</p>
          {stageNumber !== 4 && !isSubmitted ? (
            <div className="mt-4">
              <div className="space-y-4">
                {stageForms[stageName].map((field, index) => (
                  <div key={index} className="flex gap-4">
                    <Input
                      placeholder="Parameter"
                      value={field.parameter}
                      onChange={(e) =>
                        handleInputChange(
                          stageNumber,
                          index,
                          "parameter",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) =>
                        handleInputChange(
                          stageNumber,
                          index,
                          "value",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleAddFields(stageNumber)}
                  variant="outline"
                  className="w-10 h-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleSubmit(stageNumber)}>
                  Submit
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Stage Parameters Section - Added above tasks */}
              {isSubmitted && hasParameters && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <h3 className="font-medium text-blue-800">
                    Stage Parameters
                  </h3>
                  <div className="mt-2 space-y-2">
                    {Object.entries(stageData.parameters).map(
                      ([param, values]) => (
                        <div key={param} className="ml-2">
                          <p className="font-medium">{param}:</p>
                          <ul className="list-disc pl-5">
                            {values.map((value, i) => (
                              <li key={i}>{value}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Tasks List */}
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-100 rounded-md border border-gray-200"
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-gray-600 text-sm">{task.description}</p>
                </div>
              ))}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => handleStartStage(stageNumber)}
                  disabled={isStageButtonDisabled(stageNumber)}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Stage
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="border-b-2 border-gray-300 bg-black text-white px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">StartupSingham</div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="text-black border-white hover:bg-neutral-900 hover:text-white"
        >
          New Project
        </Button>
      </nav>

      {/* Main Content - Fill the entire screen */}
      <div className="flex flex-1 p-4 gap-6 h-full">
        {/* Projects List - Left Panel */}
        <Card
          className="w-1/4 border-2 border-gray-300 overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
          }}
        >
          <CardHeader className="border-b border-gray-200">
            <CardTitle>Projects List</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="py-4 text-center">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No projects found. Create a new project to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.projectId}
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                      selectedProject?.projectId === project.projectId
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div
                      className="flex-1"
                      onClick={() => {
                        setSelectedProject(project);
                        setStageStatus({
                          stage1: { status: "not_started", progress: 0 },
                          stage2: { status: "not_started", progress: 0 },
                          stage3: { status: "not_started", progress: 0 },
                          stage4: { status: "not_started", progress: 0 },
                        });
                      }}
                    >
                      {/* {project.name} ({project.projectId}) */}
                      {project.name}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-0 h-8 w-8 rounded-full ${
                            selectedProject?._id === project._id
                              ? "text-white hover:bg-neutral-400"
                              : "text-neutral-300 hover:bg-neutral-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleExportProject(project._id)}
                        >
                          Export Project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Details - Right Panel */}
        <Card
          className="w-3/4 rounded-xl border-2 border-gray-300 overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f5f5f5)",
          }}
        >
          <CardContent className="p-6 h-full">
            {selectedProject ? (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6">
                  {selectedProject.name}
                </h2>

                {/* <div className="mb-6">
                  <Card className="rounded-xl border-2 border-gray-300 p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Project Analytics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
        
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">
                          Startup Locations in Tamil Nadu
                        </h4>
                        <div className="relative h-64 bg-gray-100 rounded-md flex items-center justify-center">
 
                          <div className="relative w-full h-full">

                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3/4 h-3/4 bg-blue-50 rounded-lg border border-blue-200"></div>
                            </div>

    
                            {selectedProject &&
                              [
                                {
                                  city: "Chennai",
                                  lat: 60,
                                  lng: 60,
                                  name: selectedProject.name,
                                  sector: "Tech",
                                },
                                {
                                  city: "Coimbatore",
                                  lat: 40,
                                  lng: 80,
                                  name: "Other Startup",
                                  sector: "Manufacturing",
                                },
                                {
                                  city: "Madurai",
                                  lat: 70,
                                  lng: 40,
                                  name: "Another Startup",
                                  sector: "Agriculture",
                                },
                              ].map((location, index) => (
                                <div
                                  key={index}
                                  className="absolute w-3 h-3 bg-red-500 rounded-full"
                                  style={{
                                    left: `${location.lat}%`,
                                    top: `${location.lng}%`,
                                  }}
                                  title={`${location.name} (${location.sector}) - ${location.city}`}
                                ></div>
                              ))}
                          </div>
                          <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                            {selectedProject
                              ? `${selectedProject.name} locations`
                              : "Startup locations"}
                          </div>
                        </div>
                      </Card>

      
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">
                          Startup Stage Distribution
                        </h4>
                        <div className="relative h-64 flex items-center justify-center">
                
                          <div className="relative w-40 h-40">
                            <svg
                              viewBox="0 0 100 100"
                              className="w-full h-full"
                            >
                
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="10"
                              />

                              {selectedProject &&
                                [
                                  {
                                    stage: "Ideation",
                                    percentage: 20,
                                    color: "#3b82f6",
                                  },
                                  {
                                    stage: "Validation",
                                    percentage: 35,
                                    color: "#10b981",
                                  },
                                  {
                                    stage: "Early Growth",
                                    percentage: 25,
                                    color: "#f59e0b",
                                  },
                                  {
                                    stage: "Scaling",
                                    percentage: 20,
                                    color: "#6366f1",
                                  },
                                ].map((segment, index, array) => {
                                  const startAngle =
                                    array
                                      .slice(0, index)
                                      .reduce(
                                        (acc, curr) => acc + curr.percentage,
                                        0
                                      ) * 3.6;
                                  const endAngle =
                                    startAngle + segment.percentage * 3.6;

                                  return (
                                    <circle
                                      key={index}
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke={segment.color}
                                      strokeWidth="10"
                                      strokeDasharray={`${segment.percentage} ${
                                        100 - segment.percentage
                                      }`}
                                      strokeDashoffset={25 - startAngle / 3.6}
                                      transform="rotate(-90 50 50)"
                                    />
                                  );
                                })}
                            </svg>

            
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-xl font-semibold">
                                  {selectedProject ? "4" : "0"} Stages
                                </div>
                                <div className="text-xs text-gray-500">
                                  Completed
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="space-y-2">
                              {[
                                { stage: "Ideation", color: "#3b82f6" },
                                { stage: "Validation", color: "#10b981" },
                                { stage: "Early Growth", color: "#f59e0b" },
                                { stage: "Scaling", color: "#6366f1" },
                              ].map((item, index) => (
                                <div key={index} className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: item.color }}
                                  ></div>
                                  <span className="text-xs">{item.stage}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </Card>
                </div> */}

                <div className="mb-6">
                  <Card className="rounded-xl border-2 border-gray-300 p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Project Analytics
                    </h3>
                    {isLoadingAnalytics ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-gray-500">Loading data...</div>
                      </div>
                    ) : analyticsData ? (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Map Visualization */}
                        <Card className="p-4">
                          <h4 className="font-medium mb-2">
                            Startup Locations in Tamil Nadu
                          </h4>
                          <div className="relative h-64 bg-gray-100 rounded-md flex items-center justify-center">
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3/4 h-3/4 bg-blue-50 rounded-lg border border-blue-200"></div>
                              </div>

                              {Object.entries(
                                analyticsData.cityDistribution
                              ).map(([city, count], index) => {
                                const cityCoordinates = {
                                  Chennai: { lat: 70, lng: 30 },
                                  Coimbatore: { lat: 40, lng: 70 },
                                  Madurai: { lat: 60, lng: 50 },
                                  // Add more cities as needed
                                };

                                const coords = cityCoordinates[city] || {
                                  lat: 50,
                                  lng: 50,
                                };
                                const size = Math.min(
                                  8,
                                  Math.max(3, count / 2)
                                );

                                return (
                                  <div
                                    key={index}
                                    className="absolute bg-red-500 rounded-full"
                                    style={{
                                      left: `${coords.lat}%`,
                                      top: `${coords.lng}%`,
                                      width: `${size}px`,
                                      height: `${size}px`,
                                    }}
                                    title={`${city} (${count} startups)`}
                                  ></div>
                                );
                              })}
                            </div>
                          </div>
                        </Card>

                        {/* const cityCoordinates = {
                                  Chennai: { lat: 70, lng: 30 },
                                  Coimbatore: { lat: 40, lng: 70 },
                                  Madurai: { lat: 60, lng: 50 },
                                  // Add more cities as needed
                                }; */}

                        {/* Ring Chart */}
                        {/* <Card className="p-4">
                          <h4 className="font-medium mb-2">
                            Startup Stage Distribution
                          </h4>
                          <div className="relative h-64 flex items-center justify-center">
                            <div className="relative w-40 h-40">
                              <svg
                                viewBox="0 0 100 100"
                                className="w-full h-full"
                              >
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="10"
                                />

                                {Object.entries(
                                  analyticsData.stageDistribution
                                ).map(([stage, count], index, array) => {
                                  const percentage =
                                    (count / analyticsData.totalStartups) * 100;
                                  const startAngle =
                                    array
                                      .slice(0, index)
                                      .reduce(
                                        (acc, [_, currCount]) =>
                                          acc +
                                          (currCount /
                                            analyticsData.totalStartups) *
                                            100,
                                        0
                                      ) * 3.6;

                                  return (
                                    <circle
                                      key={index}
                                      cx="50"
                                      cy="50"
                                      r="45"
                                      fill="none"
                                      stroke={getColorForStage(stage)}
                                      strokeWidth="10"
                                      strokeDasharray={`${percentage} ${
                                        100 - percentage
                                      }`}
                                      strokeDashoffset={25 - startAngle / 3.6}
                                      transform="rotate(-90 50 50)"
                                    />
                                  );
                                })}
                              </svg>

                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-xl font-semibold">
                                    {analyticsData.totalStartups}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Startups
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <div className="space-y-2">
                                {Object.entries(
                                  analyticsData.stageDistribution
                                ).map(([stage, count], index) => {
                                  const percentage = Math.round(
                                    (count / analyticsData.totalStartups) * 100
                                  );
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center"
                                    >
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{
                                          backgroundColor:
                                            getColorForStage(stage),
                                        }}
                                      ></div>
                                      <span className="text-xs">
                                        {stage} ({percentage}%)
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </Card> */}

                        {/* Ring Chart */}
                        <Card className="p-4">
                          <h4 className="font-medium mb-2">
                            Startup Stage Distribution
                          </h4>
                          <div className="relative h-64">
                            {/* Center the chart both horizontally and vertically */}
                            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                              <div className="relative w-40 h-40">
                                <svg
                                  viewBox="0 0 100 100"
                                  className="w-full h-full"
                                >
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="10"
                                  />

                                  {Object.entries(
                                    analyticsData?.stageDistribution || {}
                                  ).map(([stage, count], index, array) => {
                                    const percentage =
                                      (count / analyticsData.totalStartups) *
                                      100;
                                    const startAngle =
                                      array
                                        .slice(0, index)
                                        .reduce(
                                          (acc, [_, currCount]) =>
                                            acc +
                                            (currCount /
                                              analyticsData.totalStartups) *
                                              100,
                                          0
                                        ) * 3.6;

                                    return (
                                      <circle
                                        key={index}
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={getColorForStage(stage)}
                                        strokeWidth="10"
                                        strokeDasharray={`${percentage} ${
                                          100 - percentage
                                        }`}
                                        strokeDashoffset={25 - startAngle / 3.6}
                                        transform="rotate(-90 50 50)"
                                      />
                                    );
                                  })}
                                </svg>

                                {/* Center text - perfectly centered */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                  <div className="text-xl font-semibold">
                                    {analyticsData?.totalStartups || 0}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Startups
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Legend - positioned to the right of the centered chart */}
                            <div className="absolute left-1/3 ml-24 top-1/2 transform -translate-y-1/2">
                              <div className="space-y-2">
                                {Object.entries(
                                  analyticsData?.stageDistribution || {}
                                ).map(([stage, count], index) => {
                                  const percentage = Math.round(
                                    (count /
                                      (analyticsData?.totalStartups || 1)) *
                                      100
                                  );
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center"
                                    >
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{
                                          backgroundColor:
                                            getColorForStage(stage),
                                        }}
                                      ></div>
                                      <span className="text-xs">
                                        {stage} ({percentage}%)
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-gray-500">
                          No analytics data available
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
                {/* Project Stage Tabs */}
                <Tabs defaultValue="stage1" className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="stage1">Stage 1</TabsTrigger>
                    <TabsTrigger value="stage2">Stage 2</TabsTrigger>
                    <TabsTrigger value="stage3">Stage 3</TabsTrigger>
                    <TabsTrigger value="stage4">Stage 4</TabsTrigger>
                  </TabsList>
                  <TabsContent value="stage1" className="flex-1 mt-0">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Stage 1: Planning</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderStageContent(
                          1,
                          "Planning",
                          `Initial planning and requirement gathering for ${selectedProject.name}.`,
                          [
                            {
                              title: "Requirements Document",
                              description:
                                "Complete the detailed requirements specification.",
                            },
                            {
                              title: "Project Timeline",
                              description:
                                "Establish milestones and delivery schedule.",
                            },
                          ]
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="stage2" className="flex-1 mt-0">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Stage 2: Development</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderStageContent(
                          2,
                          "Development",
                          `Active development phase for ${selectedProject.name}.`,
                          [
                            {
                              title: "Frontend Implementation",
                              description:
                                "User interface development based on approved designs.",
                            },
                            {
                              title: "Backend Services",
                              description:
                                "API development and database integration.",
                            },
                          ]
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="stage3" className="flex-1 mt-0">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Stage 3: Deployment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderStageContent(
                          3,
                          "Deployment",
                          `Final testing and deployment phase for ${selectedProject.name}.`,
                          [
                            {
                              title: "Quality Assurance",
                              description:
                                "Final testing and bug fixes before launch.",
                            },
                            {
                              title: "Production Deployment",
                              description:
                                "Live deployment and monitoring setup.",
                            },
                          ]
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="stage4" className="flex-1 mt-0">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Stage 4: Maintenance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderStageContent(
                          4,
                          "Maintenance",
                          `Ongoing maintenance and support for ${selectedProject.name}.`,
                          [
                            {
                              title: "Performance Monitoring",
                              description:
                                "Track system performance and identify optimizations.",
                            },
                            {
                              title: "Feature Updates",
                              description:
                                "Implement new features and enhancements based on feedback.",
                            },
                          ]
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-xl">Choose A Project</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Project Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-url">Form URL</Label>
              <Input
                id="form-url"
                placeholder="Enter form URL"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="text-sm text-gray-500 mb-2">
                    {csvFile
                      ? csvFile.name
                      : "Click to upload or drag and drop"}
                  </div>
                  {/* <Button type="button" variant="outline" size="sm">
                    Select CSV File
                  </Button> */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("csv-file").click()}
                  >
                    Select CSV File
                  </Button>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// "use client";
// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal, Play, Plus } from "lucide-react";
// import {
//   PieChart,
//   Pie,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   Cell,
// } from "recharts";
// import { useQuery } from "@tanstack/react-query";

// // Mock user ID for demonstration - in a real app, this would come from authentication
// const USER_ID = "leroy";

// export default function Home() {
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formUrl, setFormUrl] = useState("");

//   const [statsData, setStatsData] = useState(null);

//   // New project form state
//   const [projectName, setProjectName] = useState("");
//   const [csvFile, setCsvFile] = useState(null);

//   // Stage status tracking
//   const [stageStatus, setStageStatus] = useState({
//     stage1: { status: "not_started", progress: 0 },
//     stage2: { status: "not_started", progress: 0 },
//     stage3: { status: "not_started", progress: 0 },
//     stage4: { status: "not_started", progress: 0 },
//   });

//   // Form state for dynamic input fields for each stage
//   const [stageForms, setStageForms] = useState({
//     stage1: [{ parameter: "", value: "" }],
//     stage2: [{ parameter: "", value: "" }],
//     stage3: [{ parameter: "", value: "" }],
//   });

//   // Track form submission status for each stage
//   const [isFormSubmitted, setIsFormSubmitted] = useState({
//     stage1: false,
//     stage2: false,
//     stage3: false,
//   });

//   const fetchStats = async () => {
//     if (!selectedProject) return;
//     try {
//       const response = await fetch(
//         `/api/projects/${selectedProject._id}/stats`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setStatsData(data);
//       }
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     }
//   };

//   // Call this when project is selected
//   useEffect(() => {
//     if (selectedProject) {
//       fetchStats();
//     }
//   }, [selectedProject]);

//   // Fetch projects from MongoDB
//   const fetchProjects = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/projects?userId=${USER_ID}`);
//       if (response.ok) {
//         const data = await response.json();
//         setProjects(data);
//       } else {
//         console.error("Failed to fetch projects");
//       }
//     } catch (error) {
//       console.error("Error fetching projects:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Load projects on component mount
//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const handleCreateProject = async () => {
//     if (!projectName.trim() || !csvFile) {
//       alert("Please provide a project name and CSV file");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("userId", USER_ID);
//     formData.append("name", projectName);
//     formData.append("formUrl", formUrl); // Add this line
//     formData.append("csvFile", csvFile);

//     try {
//       const response = await fetch("/api/projects", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         fetchProjects();
//         setProjectName("");
//         setFormUrl(""); // Reset form URL
//         setCsvFile(null);
//         setIsModalOpen(false);
//       }
//     } catch (error) {
//       console.error("Error creating project:", error);
//     }
//   };

//   // Delete project
//   const handleDeleteProject = async (projectId) => {
//     if (window.confirm("Are you sure you want to delete this project?")) {
//       try {
//         const response = await fetch(`/api/projects/${projectId}`, {
//           method: "DELETE",
//         });

//         if (response.ok) {
//           // If the deleted project was selected, clear selection
//           if (selectedProject?._id === projectId) {
//             setSelectedProject(null);
//           }
//           // Refresh projects list
//           fetchProjects();
//         } else {
//           alert("Failed to delete project");
//         }
//       } catch (error) {
//         console.error("Error deleting project:", error);
//         alert("Error deleting project");
//       }
//     }
//   };

//   // Export project
//   const handleExportProject = async (projectId) => {
//     try {
//       const response = await fetch(`/api/projects/${projectId}/export`);

//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `project-${projectId}.csv`;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         a.remove();
//       } else {
//         alert("Failed to export project");
//       }
//     } catch (error) {
//       console.error("Error exporting project:", error);
//       alert("Error exporting project");
//     }
//   };

//   // Handle adding new input fields for a specific stage
//   const handleAddFields = (stageNumber) => {
//     const stageName = `stage${stageNumber}`;
//     setStageForms((prev) => ({
//       ...prev,
//       [stageName]: [...prev[stageName], { parameter: "", value: "" }],
//     }));
//   };

//   // Handle input change for a specific stage
//   const handleInputChange = (stageNumber, index, field, value) => {
//     const stageName = `stage${stageNumber}`;
//     const newFormFields = [...stageForms[stageName]];
//     newFormFields[index][field] = value;
//     setStageForms((prev) => ({
//       ...prev,
//       [stageName]: newFormFields,
//     }));
//   };

//   const handleSubmit = async (stageNumber) => {
//     if (!selectedProject) {
//       alert("No project selected");
//       return;
//     }

//     const stageName = `stage${stageNumber}`;
//     const parameters = {};

//     // Flatten the parameter values
//     stageForms[stageName].forEach((field) => {
//       if (field.parameter && field.value) {
//         if (!parameters[field.parameter]) {
//           parameters[field.parameter] = [];
//         }
//         // Directly push the value instead of creating nested arrays
//         parameters[field.parameter].push(field.value);
//       }
//     });

//     try {
//       const response = await fetch(
//         `/api/projects/${selectedProject._id}/stages`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             projectId: selectedProject._id,
//             stageNumber,
//             parameters,
//           }),
//         }
//       );

//       if (response.ok) {
//         setIsFormSubmitted((prev) => ({
//           ...prev,
//           [stageName]: true,
//         }));
//         setStageForms((prev) => ({
//           ...prev,
//           [stageName]: [{ parameter: "", value: "" }],
//         }));
//       }
//     } catch (error) {
//       console.error("Error saving stage data:", error);
//     }
//   };

//   // Check if a stage button should be disabled
//   const isStageButtonDisabled = (stageNumber) => {
//     if (stageNumber === 1) return false; // First stage is always enabled

//     // Check if the previous stage is completed
//     const prevStageName = `stage${stageNumber - 1}`;
//     return stageStatus[prevStageName].status !== "completed";
//   };

//   // Add this useEffect to load submission status when project is selected
//   useEffect(() => {
//     const checkStageSubmission = async () => {
//       if (selectedProject) {
//         try {
//           const response = await fetch(
//             `/api/projects/${selectedProject._id}/stages/status`
//           );
//           if (response.ok) {
//             const status = await response.json();
//             setIsFormSubmitted(status);
//           }
//         } catch (error) {
//           console.error("Error checking stage submission:", error);
//         }
//       }
//     };
//     checkStageSubmission();
//   }, [selectedProject]);

//   // Modify the renderStageContent function
//   const renderStageContent = (stageNumber, title, description, tasks) => {
//     const stageName = `stage${stageNumber}`;
//     const status = stageStatus[stageName].status;
//     const progress = stageStatus[stageName].progress;

//     const isSubmitted = isFormSubmitted[stageName];

//     if (status === "processing") {
//       return (
//         <div className="flex flex-col items-center justify-center h-64">
//           <h3 className="text-xl font-semibold mb-4">
//             Processing Stage {stageNumber}
//           </h3>
//           <div className="w-full max-w-md h-4 bg-gray-200 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
//               style={{ width: `${progress}%` }}
//             ></div>
//           </div>
//           <p className="mt-2 text-gray-600">{progress}% Complete</p>
//         </div>
//       );
//     } else if (status === "completed") {
//       return (
//         <div>
//           <p>{description}</p>
//           <div className="mt-4 space-y-4">
//             {tasks.map((task, idx) => (
//               <div
//                 key={idx}
//                 className="p-3 bg-green-50 rounded-md border border-green-200"
//               >
//                 <h3 className="font-medium">{task.title}</h3>
//                 <p className="text-gray-600 text-sm">{task.description}</p>
//                 <div className="mt-2">
//                   <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
//                     Completed
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     } else {
//       return (
//         <div>
//           <p>{description}</p>
//           {stageNumber !== 4 && !isSubmitted ? (
//             <div className="mt-4">
//               <div className="space-y-4">
//                 {stageForms[stageName].map((field, index) => (
//                   <div key={index} className="flex gap-4">
//                     <Input
//                       placeholder="Parameter"
//                       value={field.parameter}
//                       onChange={(e) =>
//                         handleInputChange(
//                           stageNumber,
//                           index,
//                           "parameter",
//                           e.target.value
//                         )
//                       }
//                     />
//                     <Input
//                       placeholder="Value"
//                       value={field.value}
//                       onChange={(e) =>
//                         handleInputChange(
//                           stageNumber,
//                           index,
//                           "value",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex gap-2 mt-4">
//                 <Button
//                   onClick={() => handleAddFields(stageNumber)}
//                   variant="outline"
//                   className="w-10 h-10 p-0"
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//                 <Button onClick={() => handleSubmit(stageNumber)}>
//                   Submit
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <div className="mt-4 space-y-4">
//               {tasks.map((task, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 bg-gray-100 rounded-md border border-gray-200"
//                 >
//                   <h3 className="font-medium">{task.title}</h3>
//                   <p className="text-gray-600 text-sm">{task.description}</p>
//                 </div>
//               ))}
//               <div className="flex justify-center mt-8">
//                 <Button
//                   onClick={() => handleStartStage(stageNumber)}
//                   disabled={isStageButtonDisabled(stageNumber)}
//                   className="flex items-center gap-2"
//                 >
//                   <Play className="h-4 w-4" />
//                   Start Stage
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       {/* Navbar */}
//       <nav className="border-b-2 border-gray-300 bg-black text-white px-6 py-4 flex justify-between items-center">
//         <div className="text-xl font-bold">StartupSingham</div>
//         <Button
//           onClick={() => setIsModalOpen(true)}
//           variant="outline"
//           className="text-black border-white hover:bg-neutral-900 hover:text-white"
//         >
//           New Project
//         </Button>
//       </nav>

//       {/* Main Content - Fill the entire screen */}
//       <div className="flex flex-1 p-4 gap-6 h-full">
//         {/* Projects List - Left Panel */}
//         <Card
//           className="w-1/4 border-2 border-gray-300 overflow-hidden"
//           style={{
//             background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
//           }}
//         >
//           <CardHeader className="border-b border-gray-200">
//             <CardTitle>Projects List</CardTitle>
//           </CardHeader>
//           <CardContent className="p-4">
//             {isLoading ? (
//               <div className="py-4 text-center">Loading projects...</div>
//             ) : projects.length === 0 ? (
//               <div className="py-4 text-center text-gray-500">
//                 No projects found. Create a new project to get started.
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {projects.map((project) => (
//                   <div
//                     key={project._id}
//                     className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
//                       selectedProject?._id === project._id
//                         ? "bg-black text-white"
//                         : "bg-gray-100 hover:bg-gray-200"
//                     }`}
//                   >
//                     <div
//                       className="flex-1"
//                       onClick={() => {
//                         setSelectedProject(project);
//                         // Reset stage status when selecting a new project
//                         setStageStatus({
//                           stage1: { status: "not_started", progress: 0 },
//                           stage2: { status: "not_started", progress: 0 },
//                           stage3: { status: "not_started", progress: 0 },
//                           stage4: { status: "not_started", progress: 0 },
//                         });
//                       }}
//                     >
//                       {project.name}
//                     </div>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className={`p-0 h-8 w-8 rounded-full ${
//                             selectedProject?._id === project._id
//                               ? "text-white hover:bg-neutral-400"
//                               : "text-neutral-300 hover:bg-neutral-600"
//                           }`}
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem
//                           onClick={() => handleExportProject(project._id)}
//                         >
//                           Export Project
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           className="text-red-600"
//                           onClick={() => handleDeleteProject(project._id)}
//                         >
//                           Delete Project
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Project Details - Right Panel */}
//         <Card
//           className="w-3/4 rounded-xl border-2 border-gray-300 overflow-hidden"
//           style={{
//             background: "linear-gradient(to bottom, #ffffff, #f5f5f5)",
//           }}
//         >
//           <CardContent className="p-6 h-full">
//             {/* {selectedProject ? (
//               <div className="h-full flex flex-col">
//                 <h2 className="text-2xl font-bold mb-6">
//                   {selectedProject.name}
//                 </h2>
//                 <Tabs defaultValue="stage1" className="flex-1 flex flex-col">
//                   <TabsList className="grid w-full grid-cols-4 mb-6">
//                     <TabsTrigger value="stage1">Stage 1</TabsTrigger>
//                     <TabsTrigger value="stage2">Stage 2</TabsTrigger>
//                     <TabsTrigger value="stage3">Stage 3</TabsTrigger>
//                     <TabsTrigger value="stage4">Stage 4</TabsTrigger>
//                   </TabsList>
//                   <TabsContent value="stage1" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 1: Planning</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           1,
//                           "Planning",
//                           `Initial planning and requirement gathering for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Requirements Document",
//                               description:
//                                 "Complete the detailed requirements specification.",
//                             },
//                             {
//                               title: "Project Timeline",
//                               description:
//                                 "Establish milestones and delivery schedule.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                   <TabsContent value="stage2" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 2: Development</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           2,
//                           "Development",
//                           `Active development phase for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Frontend Implementation",
//                               description:
//                                 "User interface development based on approved designs.",
//                             },
//                             {
//                               title: "Backend Services",
//                               description:
//                                 "API development and database integration.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                   <TabsContent value="stage3" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 3: Deployment</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           3,
//                           "Deployment",
//                           `Final testing and deployment phase for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Quality Assurance",
//                               description:
//                                 "Final testing and bug fixes before launch.",
//                             },
//                             {
//                               title: "Production Deployment",
//                               description:
//                                 "Live deployment and monitoring setup.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                   <TabsContent value="stage4" className="flex-1 mt-0">
//                     <Card className="border-2">
//                       <CardHeader>
//                         <CardTitle>Stage 4: Maintenance</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {renderStageContent(
//                           4,
//                           "Maintenance",
//                           `Ongoing maintenance and support for ${selectedProject.name}.`,
//                           [
//                             {
//                               title: "Performance Monitoring",
//                               description:
//                                 "Track system performance and identify optimizations.",
//                             },
//                             {
//                               title: "Feature Updates",
//                               description:
//                                 "Implement new features and enhancements based on feedback.",
//                             },
//                           ]
//                         )}
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">
//                 <p className="text-xl">Choose A Project</p>
//               </div>
//             )} */}

//             {selectedProject ? (
//               <div className="h-full flex flex-col">
//                 <h2 className="text-2xl font-bold mb-6">
//                   {selectedProject.name}
//                 </h2>

//                 {/* Add this new Statistics section */}
//                 <Card className="mb-6 rounded-lg border-2">
//                   <CardHeader>
//                     <CardTitle>Entire Entry Statistics</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     {/* {statsData ? (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="border p-4 rounded-lg">
//                           <h3 className="text-lg font-semibold mb-4">
//                             Data Distribution
//                           </h3>
//                           <div className="h-64">
//                             <PieChart width={300} height={250}>
//                               <Pie
//                                 data={statsData.columns.map((col) => ({
//                                   name: col,
//                                   value: statsData.sampleData.filter(
//                                     (d) => d[col]
//                                   ).length,
//                                 }))}
//                                 cx="50%"
//                                 cy="50%"
//                                 outerRadius={80}
//                                 fill="#8884d8"
//                                 label
//                                 dataKey="value"
//                               >
//                                 {statsData.columns.map((entry, index) => (
//                                   <Cell
//                                     key={`cell-${index}`}
//                                     fill={`#${Math.floor(
//                                       Math.random() * 16777215
//                                     ).toString(16)}`}
//                                   />
//                                 ))}
//                               </Pie>
//                               <Tooltip />
//                               <Legend />
//                             </PieChart>
//                           </div>
//                         </div>

//                         <div className="border p-4 rounded-lg">
//                           <h3 className="text-lg font-semibold mb-4">
//                             Data Overview
//                           </h3>
//                           <div className="h-64">
//                             <BarChart
//                               width={300}
//                               height={250}
//                               data={statsData.sampleData}
//                               margin={{
//                                 top: 20,
//                                 right: 30,
//                                 left: 20,
//                                 bottom: 5,
//                               }}
//                             >
//                               <XAxis dataKey={statsData.columns[0]} />
//                               <YAxis />
//                               <Tooltip />
//                               <Legend />
//                               {statsData.columns.slice(0, 3).map((col, i) => (
//                                 <Bar
//                                   key={col}
//                                   dataKey={col}
//                                   fill={`#${Math.floor(
//                                     Math.random() * 16777215
//                                   ).toString(16)}`}
//                                 />
//                               ))}
//                             </BarChart>
//                           </div>
//                         </div>

//                         <div className="border p-4 rounded-lg col-span-2">
//                           <h3 className="text-lg font-semibold mb-4">
//                             Summary
//                           </h3>
//                           <div className="grid grid-cols-3 gap-4">
//                             <div className="bg-gray-100 p-3 rounded">
//                               <p className="text-sm text-gray-600">
//                                 Total Entries
//                               </p>
//                               <p className="text-xl font-bold">
//                                 {statsData.totalEntries}
//                               </p>
//                             </div>
//                             <div className="bg-gray-100 p-3 rounded">
//                               <p className="text-sm text-gray-600">Columns</p>
//                               <p className="text-xl font-bold">
//                                 {statsData.columns.length}
//                               </p>
//                             </div>
//                             <div className="bg-gray-100 p-3 rounded">
//                               <p className="text-sm text-gray-600">
//                                 Sample Data
//                               </p>
//                               <p className="text-xl font-bold">5 rows</p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="py-8 text-center">
//                         Loading statistics...
//                       </div>
//                     )} */}

//                     {statsData ? (
//                       <div className="grid grid-cols-1 gap-6">
//                         {/* Map Visualization */}
//                         <Card className="border p-4 rounded-lg">
//                           <CardHeader>
//                             <CardTitle>Startup Locations Map</CardTitle>
//                           </CardHeader>
//                           <CardContent>
//                             <div className="h-96">
//                               <ScatterChart
//                                 width={800}
//                                 height={400}
//                                 margin={{
//                                   top: 20,
//                                   right: 20,
//                                   left: 20,
//                                   bottom: 20,
//                                 }}
//                               >
//                                 <CartesianGrid />
//                                 <XAxis
//                                   type="number"
//                                   dataKey="lng"
//                                   name="Longitude"
//                                   domain={["auto", "auto"]}
//                                   label={{
//                                     value: "Longitude",
//                                     position: "bottom",
//                                   }}
//                                 />
//                                 <YAxis
//                                   type="number"
//                                   dataKey="lat"
//                                   name="Latitude"
//                                   label={{
//                                     value: "Latitude",
//                                     angle: -90,
//                                     position: "left",
//                                   }}
//                                 />
//                                 <Tooltip
//                                   content={({ payload }) =>
//                                     payload[0] && (
//                                       <div className="bg-white p-2 border rounded">
//                                         <p>{payload[0].payload.name}</p>
//                                         <p>
//                                           Sector: {payload[0].payload.sector}
//                                         </p>
//                                         <p>City: {payload[0].payload.city}</p>
//                                       </div>
//                                     )
//                                   }
//                                 />
//                                 <Scatter
//                                   name="Startups"
//                                   data={statsData.locations}
//                                   fill="#8884d8"
//                                 />
//                               </ScatterChart>
//                             </div>
//                           </CardContent>
//                         </Card>

//                         {/* Stage Distribution */}
//                         <Card className="border p-4 rounded-lg">
//                           <CardHeader>
//                             <CardTitle>Startup Stage Distribution</CardTitle>
//                           </CardHeader>
//                           <CardContent>
//                             <div className="h-96">
//                               <PieChart width={800} height={400}>
//                                 <Pie
//                                   data={statsData.stageData}
//                                   dataKey="value"
//                                   nameKey="name"
//                                   cx="50%"
//                                   cy="50%"
//                                   outerRadius={150}
//                                   innerRadius={70}
//                                   label={({ name, percent }) =>
//                                     `${name}: ${(percent * 100).toFixed(0)}%`
//                                   }
//                                 >
//                                   {statsData.stageData.map((entry, index) => (
//                                     <Cell
//                                       key={`cell-${index}`}
//                                       fill={entry.fill}
//                                     />
//                                   ))}
//                                 </Pie>
//                                 <Legend
//                                   layout="vertical"
//                                   align="right"
//                                   verticalAlign="middle"
//                                   formatter={(value, entry) => (
//                                     <span style={{ color: "#333" }}>
//                                       {value}
//                                     </span>
//                                   )}
//                                 />
//                                 <Tooltip
//                                   formatter={(value, name, props) => [
//                                     value,
//                                     `${props.payload.name}: ${(
//                                       (props.payload.value /
//                                         statsData.totalStartups) *
//                                       100
//                                     ).toFixed(1)}%`,
//                                   ]}
//                                 />
//                               </PieChart>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       </div>
//                     ) : (
//                       <div className="py-8 text-center">
//                         Loading statistics...
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>

//                 {/* Existing Project Stage Tabs */}
//                 <Tabs defaultValue="stage1" className="flex-1 flex flex-col">
//                   {/* ... rest of your existing tabs code ... */}
//                 </Tabs>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500">
//                 <p className="text-xl">Choose A Project</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* New Project Modal */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create New Project</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-2">
//             <div className="space-y-2">
//               <Label htmlFor="project-name">Project Name</Label>
//               <Input
//                 id="project-name"
//                 placeholder="Enter project name"
//                 value={projectName}
//                 onChange={(e) => setProjectName(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="form-url">Form URL</Label>
//               <Input
//                 id="form-url"
//                 placeholder="Enter form URL"
//                 value={formUrl}
//                 onChange={(e) => setFormUrl(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="csv-file">Upload CSV File</Label>
//               <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8">
//                 <Input
//                   id="csv-file"
//                   type="file"
//                   accept=".csv"
//                   onChange={(e) => setCsvFile(e.target.files[0])}
//                   className="hidden"
//                 />
//                 <label
//                   htmlFor="csv-file"
//                   className="flex flex-col items-center cursor-pointer"
//                 >
//                   <div className="text-sm text-gray-500 mb-2">
//                     {csvFile
//                       ? csvFile.name
//                       : "Click to upload or drag and drop"}
//                   </div>
//                   {/* <Button type="button" variant="outline" size="sm">
//                     Select CSV File
//                   </Button> */}
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => document.getElementById("csv-file").click()}
//                   >
//                     Select CSV File
//                   </Button>
//                 </label>
//               </div>
//             </div>
//             {/* <div className="space-y-2">
//               <Label htmlFor="csv-file">Upload CSV File</Label>
//               <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8">
//                 <Input
//                   id="csv-file"
//                   type="file"
//                   accept=".csv"
//                   onChange={(e) => setCsvFile(e.target.files?.[0])}
//                   className="hidden"
//                 />
//                 <div className="flex flex-col items-center">
//                   <div className="text-sm text-gray-500 mb-2">
//                     {csvFile
//                       ? csvFile.name
//                       : "Drag and drop your CSV file here, or click the button below"}
//                   </div>
//                   <label htmlFor="csv-file" className="cursor-pointer">
//                     <Button type="button" variant="outline" size="sm">
//                       Select CSV File
//                     </Button>
//                   </label>
//                 </div>
//               </div>
//             </div> */}
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setIsModalOpen(false)} variant="outline">
//               Cancel
//             </Button>
//             <Button onClick={handleCreateProject}>Create Project</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
