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
    formData.append("formUrl", formUrl); // Add this line
    formData.append("csvFile", csvFile);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchProjects();
        setProjectName("");
        setFormUrl(""); // Reset form URL
        setCsvFile(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // If the deleted project was selected, clear selection
          if (selectedProject?._id === projectId) {
            setSelectedProject(null);
          }
          // Refresh projects list
          fetchProjects();
        } else {
          alert("Failed to delete project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Error deleting project");
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
        // Directly push the value instead of creating nested arrays
        parameters[field.parameter].push(field.value);
      }
    });

    try {
      const response = await fetch(
        `/api/projects/${selectedProject._id}/stages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: selectedProject._id,
            stageNumber,
            parameters,
          }),
        }
      );

      if (response.ok) {
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
  useEffect(() => {
    const checkStageSubmission = async () => {
      if (selectedProject) {
        try {
          const response = await fetch(
            `/api/projects/${selectedProject._id}/stages/status`
          );
          if (response.ok) {
            const status = await response.json();
            setIsFormSubmitted(status);
          }
        } catch (error) {
          console.error("Error checking stage submission:", error);
        }
      }
    };
    checkStageSubmission();
  }, [selectedProject]);

  // Modify the renderStageContent function
  const renderStageContent = (stageNumber, title, description, tasks) => {
    const stageName = `stage${stageNumber}`;
    const status = stageStatus[stageName].status;
    const progress = stageStatus[stageName].progress;

    const isSubmitted = isFormSubmitted[stageName];

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
                    key={project._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                      selectedProject?._id === project._id
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div
                      className="flex-1"
                      onClick={() => {
                        setSelectedProject(project);
                        // Reset stage status when selecting a new project
                        setStageStatus({
                          stage1: { status: "not_started", progress: 0 },
                          stage2: { status: "not_started", progress: 0 },
                          stage3: { status: "not_started", progress: 0 },
                          stage4: { status: "not_started", progress: 0 },
                        });
                      }}
                    >
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
