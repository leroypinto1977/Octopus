"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BarChart,
  PieChart,
  Pie,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import {
  TrendingUp,
  Play,
  Plus,
  MoreHorizontal,
  Download, // Add this import
} from "lucide-react";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock user ID for demonstration - in a real app, this would come from authentication
const USER_ID = "leroy";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");

  const [stagesData, setStagesData] = useState({});

  // New project form state
  const [projectName, setProjectName] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [stageReportData, setStageReportData] = useState({});
  const [fetchedStages, setFetchedStages] = useState({});

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

  useEffect(() => {
    if (selectedProject) {
      // Check all stages and fetch data for completed ones
      [1, 2, 3, 4].forEach((stageNumber) => {
        const stageName = `stage${stageNumber}`;
        if (
          stageStatus[stageName]?.status === "completed" &&
          !fetchedStages[stageNumber]
        ) {
          fetchStageReportData(selectedProject.projectId, stageNumber);
          setFetchedStages((prev) => ({
            ...prev,
            [stageNumber]: true,
          }));
        }
      });
    }
  }, [selectedProject, stageStatus, fetchedStages]);

  const fetchStageReportData = async (projectId, stageNumber) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/stages/${stageNumber}/report-data`
      );
      if (response.ok) {
        const data = await response.json();
        setStageReportData((prev) => ({
          ...prev,
          [stageNumber]: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching stage report data:", error);
    }
  };

  const handleStartStage = async (stageNumber) => {
    if (!selectedProject) {
      alert("No project selected");
      return;
    }

    // Update UI and database to processing state
    setStageStatus((prev) => ({
      ...prev,
      [`stage${stageNumber}`]: { status: "processing", progress: 0 },
    }));

    try {
      // Update stage status in database
      const updateResponse = await fetch(
        `/api/projects/${selectedProject.projectId}/stages/${stageNumber}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "processing", progress: 0 }),
        }
      );
      if (!updateResponse.ok) throw new Error("Failed to update stage status");

      // Call n8n endpoint
      const response = await fetch(
        `https://leroyaxtr.app.n8n.cloud/webhook/db4cff1b-2e0d-49cb-a28c-c176ff48abc3`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selectedProject.projectId,
            stageNumber: stageNumber,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to start stage");

      // Simulate progress updates
      const interval = setInterval(async () => {
        setStageStatus((prev) => {
          const newProgress = Math.min(
            prev[`stage${stageNumber}`].progress + 20,
            100
          );

          if (newProgress === 100) {
            clearInterval(interval);
            // Update database to completed
            fetch(
              `/api/projects/${selectedProject.projectId}/stages/${stageNumber}/status`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "completed", progress: 100 }),
              }
            ).catch(console.error);
            return {
              ...prev,
              [`stage${stageNumber}`]: { status: "completed", progress: 100 },
            };
          }

          return {
            ...prev,
            [`stage${stageNumber}`]: {
              status: "processing",
              progress: newProgress,
            },
          };
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting stage:", error);
      // Revert status on error
      setStageStatus((prev) => ({
        ...prev,
        [`stage${stageNumber}`]: { status: "not_started", progress: 0 },
      }));
      fetch(
        `/api/projects/${selectedProject.projectId}/stages/${stageNumber}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "not_started", progress: 0 }),
        }
      ).catch(console.error);
    }
  };

  const handleDownloadReport = async (stageNumber) => {
    if (!selectedProject) {
      alert("No project selected");
      return;
    }

    try {
      // Make the POST request to the n8n webhook and handle the blob response
      const response = await fetch(
        "https://leroyaxtr.app.n8n.cloud/webhook/0c7ef2fc-bd27-4499-9227-484c768fa7a6",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/octet-stream",
          },
          body: JSON.stringify({
            projectId: selectedProject.projectId,
            // projectId: "PRJ_1744771826173_6135",
            stageNumber: stageNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate and download report");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `${selectedProject.projectId}-stage-${stageNumber}-report.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]=((['"]).?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Error generating or downloading report");
    }
  };

  useEffect(() => {
    const fetchStagesData = async () => {
      if (selectedProject) {
        try {
          const response = await fetch(
            `/api/projects/${selectedProject.projectId}/stages/data`
          );
          if (response.ok) {
            const data = await response.json();
            const stages = data.reduce((acc, stage) => {
              acc[`stage${stage.stageNumber}`] = stage;
              return acc;
            }, {});
            setStagesData(stages);

            // Add the merging logic here
            const defaultStatus = {
              stage1: { status: "not_started", progress: 0 },
              stage2: { status: "not_started", progress: 0 },
              stage3: { status: "not_started", progress: 0 },
              stage4: { status: "not_started", progress: 0 },
            };

            const fetchedStatus = data.reduce((acc, stage) => {
              acc[`stage${stage.stageNumber}`] = {
                status: stage.status,
                progress: stage.progress,
              };
              return acc;
            }, {});

            const mergedStatus = { ...defaultStatus, ...fetchedStatus };
            setStageStatus(mergedStatus);
          }
        } catch (error) {
          console.error("Error fetching stages data:", error);
        }
      }
    };
    fetchStagesData();
  }, [selectedProject]);

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
        setSelectedProject(newProject);
      }

      console.log(await response.json());
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

  useEffect(() => {
    const fetchStagesData = async () => {
      if (selectedProject) {
        try {
          const response = await fetch(
            `/api/projects/${selectedProject.projectId}/stages/data`
          );
          if (response.ok) {
            const data = await response.json();
            // Convert array to object by stageNumber
            const stages = data.reduce((acc, stage) => {
              acc[`stage${stage.stageNumber}`] = stage;
              return acc;
            }, {});
            setStagesData(stages);
          }
        } catch (error) {
          console.error("Error fetching stages data:", error);
        }
      }
    };
    fetchStagesData();
  }, [selectedProject]);

  const handleSubmit = async (stageNumber) => {
    if (!selectedProject) {
      alert("No project selected");
      return;
    }

    const stageName = `stage${stageNumber}`;
    const parameters = {};

    // Collect parameters
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
            stageNumber,
            parameters,
          }),
        }
      );

      if (response.ok) {
        const { stage } = await response.json();

        setIsFormSubmitted((prev) => ({
          ...prev,
          [stageName]: true,
        }));

        setStageForms((prev) => ({
          ...prev,
          [stageName]: [{ parameter: "", value: "" }],
        }));

        // Refresh stage data
        const statusResponse = await fetch(
          `/api/projects/${selectedProject.projectId}/stages/status`
        );
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          setIsFormSubmitted(status);
        }

        const stagesResponse = await fetch(
          `/api/projects/${selectedProject.projectId}/stages/data`
        );
        if (stagesResponse.ok) {
          const data = await stagesResponse.json();
          const stages = data.reduce((acc, stage) => {
            acc[`stage${stage.stageNumber}`] = stage;
            return acc;
          }, {});
          setStagesData(stages);
        }
      }
    } catch (error) {
      console.error("Error saving stage data:", error);
    }
  };

  const isStageButtonDisabled = (stageNumber) => {
    if (stageNumber === 1) return false;
    const prevStageName = `stage${stageNumber - 1}`;
    return stageStatus[prevStageName]?.status !== "completed";
  };

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
        const { data } = await response.json();
        // Add null checks for all data properties
        setAnalyticsData({
          legalEntityDistribution: data?.legalEntityDistribution || {},
          cityDistribution: data?.cityDistribution || {},
          stageDistribution: data?.stageDistribution || {},
          sectorDistribution: data?.sectorDistribution || {},
          totalStartups: data?.totalStartups || 0,
        });
      } else {
        // Set empty state if response fails
        setAnalyticsData({
          legalEntityDistribution: {},
          cityDistribution: {},
          stageDistribution: {},
          sectorDistribution: {},
          totalStartups: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Set empty state on error
      setAnalyticsData({
        legalEntityDistribution: {},
        cityDistribution: {},
        stageDistribution: {},
        sectorDistribution: {},
        totalStartups: 0,
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Update the status check useEffect:
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
          }
        } catch (error) {
          console.error("Error checking stage submission:", error);
        }
      }
    };
    checkStageSubmission();
  }, [selectedProject]);

  const renderStageContent = (stageNumber, title, description, tasks) => {
    const stageName = `stage${stageNumber}`;
    // const status = stageStatus[stageName].status;
    // const progress = stageStatus[stageName].progress;
    const status = stageStatus[stageName]?.status || "not_started";
    const progress = stageStatus[stageName]?.progress || 0;

    const isSubmitted = isFormSubmitted[stageName];
    const currentProject = projects.find(
      (p) => p.projectId === selectedProject?.projectId
    );

    const stageData = stagesData[stageName];
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
      // useEffect(() => {
      //   if (selectedProject && !stageReportData[stageNumber]) {
      //     fetchStageReportData(selectedProject.projectId, stageNumber);
      //   }
      // }, [selectedProject, stageNumber]);

      // const currentReportData = stageReportData[stageNumber] || [];

      const currentReportData = stageReportData[stageNumber] || [];

      return (
        <div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-green-800">
                  Stage Completed
                </h3>
                <p className="text-sm text-green-700">
                  All tasks for this stage have been successfully completed
                </p>
              </div>
              <Button
                onClick={() => handleDownloadReport(stageNumber)}
                variant="success"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="mr-2 h-4 w-4 text-white" />
                Download Report
              </Button>
            </div>

            {/* Stage Charts */}
            {isLoadingAnalytics ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-500">Loading data...</div>
              </div>
            ) : analyticsData ? (
              //          {
              /* <div className="grid grid-cols-2 gap-4">
                // Bar Chart - Startup Count by City 
                <Card>
                  <CardHeader>
                    <CardTitle>Startup Count by City</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: {
                          label: "Startups",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <BarChart
                        accessibilityLayer
                        data={Object.entries(
                          analyticsData.cityDistribution || {}
                        ).map(([name, value]) => ({ name, value }))}
                        margin={{ top: 20 }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="value"
                          fill="var(--color-value)"
                          radius={[8, 8, 0, 0]}
                        >
                          <LabelList
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                // Pie Chart - Current Startup Stage
                <Card>
                  <CardHeader>
                    <CardTitle>Startup Count by Stage</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <ChartContainer
                      config={{
                        ...Object.fromEntries(
                          Object.keys(
                            analyticsData.stageDistribution || {}
                          ).map((stage, index) => [
                            stage,
                            {
                              label: stage,
                              color: `hsl(var(--chart-${(index % 5) + 1}))`,
                            },
                          ])
                        ),
                      }}
                      className="mx-auto aspect-square max-h-[250px] px-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent nameKey="value" hideLabel />
                          }
                        />
                        <Pie
                          data={Object.entries(
                            analyticsData.stageDistribution || {}
                          ).map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          labelLine={false}
                          label={({ payload, ...props }) => {
                            return (
                              <text
                                cx={props.cx}
                                cy={props.cy}
                                x={props.x}
                                y={props.y}
                                textAnchor={props.textAnchor}
                                dominantBaseline={props.dominantBaseline}
                                fill="hsla(var(--foreground))"
                              >
                                {payload.value}
                              </text>
                            );
                          }}
                        >
                          {Object.entries(
                            analyticsData.stageDistribution || {}
                          ).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(var(--chart-${(index % 6) + 1}))`}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                      Showing distribution of startups by current stage
                    </div>
                  </CardFooter>
                </Card>

                // Donut Chart - Legal Entity Type Distribution
                <Card>
                  <CardHeader>
                    <CardTitle>Legal Entity Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <ChartContainer
                      config={{
                        ...Object.fromEntries(
                          Object.keys(
                            analyticsData.legalEntityDistribution || {}
                          ).map((entity, index) => [
                            entity,
                            {
                              label: entity,
                              color: `hsl(var(--chart-${(index % 6) + 1}))`,
                            },
                          ])
                        ),
                      }}
                      className="mx-auto aspect-square max-h-[250px] px-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent nameKey="value" hideLabel />
                          }
                        />
                        <Pie
                          data={Object.entries(
                            analyticsData.legalEntityDistribution || {}
                          ).map(([name, value]) => ({ name, value }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          labelLine={false}
                          label={({ payload, ...props }) => (
                            <text
                              cx={props.cx}
                              cy={props.cy}
                              x={props.x}
                              y={props.y}
                              textAnchor={props.textAnchor}
                              dominantBaseline={props.dominantBaseline}
                              fill="hsla(var(--foreground))"
                            >
                              {payload.value}
                            </text>
                          )}
                        >
                          {Object.entries(
                            analyticsData.legalEntityDistribution || {}
                          ).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(var(--chart-${(index % 6) + 1}))`}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                      Showing distribution of legal entity types across startups
                    </div>
                  </CardFooter>
                </Card>

                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Sector Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <ChartContainer
                      config={{
                        ...Object.fromEntries(
                          Object.keys(
                            analyticsData.sectorDistribution || {}
                          ).map((sector, index) => [
                            sector,
                            {
                              label: sector,
                              color: `hsl(var(--chart-${(index % 6) + 1}))`,
                            },
                          ])
                        ),
                      }}
                      className="mx-auto aspect-square max-h-[250px] px-0 [&_.recharts-pie-label-text]:fill-foreground"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent nameKey="value" hideLabel />
                          }
                        />
                        <Pie
                          data={Object.entries(
                            analyticsData.sectorDistribution || {}
                          ).map(([name, value], index) => ({
                            name,
                            value,
                            fill: localColors[index % 6],
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ payload, ...props }) => (
                            <text
                              cx={props.cx}
                              cy={props.cy}
                              x={props.x}
                              y={props.y}
                              textAnchor={props.textAnchor}
                              dominantBaseline={props.dominantBaseline}
                              fill="hsla(var(--foreground))"
                            >
                              {payload.value}
                            </text>
                          )}
                          labelLine={false}
                        />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                      Showing distribution of startups by sector
                    </div>
                  </CardFooter>
                </Card>
              </div> */

              //  }

              <div className="grid grid-cols-2 gap-4">
                {/* Bar Chart - Startup Count by City */}
                <Card>
                  <CardHeader>
                    <CardTitle>Startup Count by City</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: {
                          label: "Startups",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <BarChart
                        accessibilityLayer
                        data={currentReportData.reduce((acc, entry) => {
                          const city = entry.city;
                          acc[city] = (acc[city] || 0) + 1;
                          return acc;
                        }, {})}
                        margin={{ top: 20 }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                          dataKey="value"
                          fill="var(--color-value)"
                          radius={[8, 8, 0, 0]}
                        >
                          <LabelList
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                          />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Pie Chart - Current Startup Stage */}
                <Card>
                  <CardHeader>
                    <CardTitle>Startup Count by Stage</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <ChartContainer
                      config={{
                        ...Object.fromEntries(
                          Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const stage = entry.stage;
                              acc.set(stage, (acc.get(stage) || 0) + 1);
                              return acc;
                            }, new Map())
                          ).map(([stage], index) => [
                            stage,
                            {
                              label: stage,
                              color: `hsl(var(--chart-${(index % 5) + 1}))`,
                            },
                          ])
                        ),
                      }}
                      className="mx-auto aspect-square max-h-[250px] px-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent nameKey="value" hideLabel />
                          }
                        />
                        <Pie
                          data={Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const stage = entry.stage;
                              acc.set(stage, (acc.get(stage) || 0) + 1);
                              return acc;
                            }, new Map()),
                            ([name, value]) => ({ name, value })
                          )}
                          dataKey="value"
                          nameKey="name"
                          labelLine={false}
                          label={({ payload, ...props }) => {
                            return (
                              <text
                                cx={props.cx}
                                cy={props.cy}
                                x={props.x}
                                y={props.y}
                                textAnchor={props.textAnchor}
                                dominantBaseline={props.dominantBaseline}
                                fill="hsla(var(--foreground))"
                              >
                                {payload.value}
                              </text>
                            );
                          }}
                        >
                          {Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const stage = entry.stage;
                              acc.set(stage, (acc.get(stage) || 0) + 1);
                              return acc;
                            }, new Map())
                          ).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(var(--chart-${(index % 6) + 1}))`}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                      Showing distribution of startups by current stage
                    </div>
                  </CardFooter>
                </Card>

                {/* Donut Chart - Legal Entity Type Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Legal Entity Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <ChartContainer
                      config={{
                        ...Object.fromEntries(
                          Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const entity = entry.legalEntity;
                              acc.set(entity, (acc.get(entity) || 0) + 1);
                              return acc;
                            }, new Map())
                          ).map(([entity], index) => [
                            entity,
                            {
                              label: entity,
                              color: `hsl(var(--chart-${(index % 6) + 1}))`,
                            },
                          ])
                        ),
                      }}
                      className="mx-auto aspect-square max-h-[250px] px-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent nameKey="value" hideLabel />
                          }
                        />
                        <Pie
                          data={Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const entity = entry.legalEntity;
                              acc.set(entity, (acc.get(entity) || 0) + 1);
                              return acc;
                            }, new Map()),
                            ([name, value]) => ({ name, value })
                          )}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          labelLine={false}
                          label={({ payload, ...props }) => (
                            <text
                              cx={props.cx}
                              cy={props.cy}
                              x={props.x}
                              y={props.y}
                              textAnchor={props.textAnchor}
                              dominantBaseline={props.dominantBaseline}
                              fill="hsla(var(--foreground))"
                            >
                              {payload.value}
                            </text>
                          )}
                        >
                          {Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const entity = entry.legalEntity;
                              acc.set(entity, (acc.get(entity) || 0) + 1);
                              return acc;
                            }, new Map())
                          ).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(var(--chart-${(index % 6) + 1}))`}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                      Showing distribution of legal entity types across startups
                    </div>
                  </CardFooter>
                </Card>

                {/* Sector Distribution */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Sector Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <ChartContainer
                      config={{
                        ...Object.fromEntries(
                          Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const sector = entry.sector;
                              acc.set(sector, (acc.get(sector) || 0) + 1);
                              return acc;
                            }, new Map())
                          ).map(([sector], index) => [
                            sector,
                            {
                              label: sector,
                              color: `hsl(var(--chart-${(index % 6) + 1}))`,
                            },
                          ])
                        ),
                      }}
                      className="mx-auto aspect-square max-h-[250px] px-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent nameKey="value" hideLabel />
                          }
                        />
                        <Pie
                          data={Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const sector = entry.sector;
                              acc.set(sector, (acc.get(sector) || 0) + 1);
                              return acc;
                            }, new Map()),
                            ([name, value]) => ({ name, value })
                          )}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ payload, ...props }) => (
                            <text
                              cx={props.cx}
                              cy={props.cy}
                              x={props.x}
                              y={props.y}
                              textAnchor={props.textAnchor}
                              dominantBaseline={props.dominantBaseline}
                              fill="hsla(var(--foreground))"
                            >
                              {payload.value}
                            </text>
                          )}
                          labelLine={false}
                        >
                          {Array.from(
                            currentReportData.reduce((acc, entry) => {
                              const sector = entry.sector;
                              acc.set(sector, (acc.get(sector) || 0) + 1);
                              return acc;
                            }, new Map())
                          ).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(var(--chart-${(index % 6) + 1}))`}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="leading-none text-muted-foreground">
                      Showing distribution of startups by sector
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-gray-500">No analytics data available</div>
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <h3 className="font-medium text-green-800">{task.title}</h3>
                <p className="text-green-700 text-sm">{task.description}</p>
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

  const entityData = Object.entries(
    analyticsData?.legalEntityDistribution || {} // Add optional chaining here
  ).map(([name, value]) => ({
    name,
    value,
    fill: `var(--color-${name})`,
  }));

  const [activeEntity, setActiveEntity] = useState(
    entityData[0]?.name || null // Handle empty entityData case
  );

  const activeIndex =
    entityData.findIndex((item) => item.name === activeEntity) || 0;
  const activeEntityData = entityData[activeIndex] || null;

  const localColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ];

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
                        {/* Bar Chart - Startup Count by City */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Startup Count by City</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ChartContainer
                              config={{
                                value: {
                                  label: "Startups",
                                  color: "hsl(var(--chart-1))",
                                },
                              }}
                            >
                              <BarChart
                                accessibilityLayer
                                data={Object.entries(
                                  analyticsData.cityDistribution || {}
                                ).map(([name, value]) => ({ name, value }))}
                                margin={{ top: 20 }}
                              >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                  dataKey="name"
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                  tickFormatter={(value) => value.slice(0, 8)}
                                />
                                <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="var(--color-value)"
                                  radius={[8, 8, 0, 0]}
                                >
                                  <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                  />
                                </Bar>
                              </BarChart>
                            </ChartContainer>
                          </CardContent>
                        </Card>

                        {/* Pie Chart - Current Startup Stage */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Startup Count by Stage</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 pt-6">
                            <ChartContainer
                              config={{
                                ...Object.fromEntries(
                                  Object.keys(
                                    analyticsData.stageDistribution || {}
                                  ).map((stage, index) => [
                                    stage,
                                    {
                                      label: stage,
                                      color: `hsl(var(--chart-${
                                        (index % 5) + 1
                                      }))`,
                                    },
                                  ])
                                ),
                              }}
                              className="mx-auto aspect-square max-h-[250px] px-0"
                            >
                              <PieChart>
                                <ChartTooltip
                                  content={
                                    <ChartTooltipContent
                                      nameKey="value"
                                      hideLabel
                                    />
                                  }
                                />
                                <Pie
                                  data={Object.entries(
                                    analyticsData.stageDistribution || {}
                                  ).map(([name, value]) => ({ name, value }))}
                                  dataKey="value"
                                  nameKey="name"
                                  labelLine={false}
                                  label={({ payload, ...props }) => {
                                    return (
                                      <text
                                        cx={props.cx}
                                        cy={props.cy}
                                        x={props.x}
                                        y={props.y}
                                        textAnchor={props.textAnchor}
                                        dominantBaseline={
                                          props.dominantBaseline
                                        }
                                        fill="hsla(var(--foreground))"
                                      >
                                        {payload.value}
                                      </text>
                                    );
                                  }}
                                >
                                  {Object.entries(
                                    analyticsData.stageDistribution || {}
                                  ).map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={`hsl(var(--chart-${
                                        (index % 6) + 1
                                      }))`}
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                          </CardContent>
                          <CardFooter className="flex-col gap-2 text-sm">
                            <div className="leading-none text-muted-foreground">
                              Showing distribution of startups by current stage
                            </div>
                          </CardFooter>
                        </Card>

                        {/* Donut Chart - Legal Entity Type Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle>
                              Legal Entity Type Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 pt-6">
                            <ChartContainer
                              config={{
                                ...Object.fromEntries(
                                  Object.keys(
                                    analyticsData.legalEntityDistribution || {}
                                  ).map((entity, index) => [
                                    entity,
                                    {
                                      label: entity,
                                      color: `hsl(var(--chart-${
                                        (index % 6) + 1
                                      }))`,
                                    },
                                  ])
                                ),
                              }}
                              className="mx-auto aspect-square max-h-[250px] px-0"
                            >
                              <PieChart>
                                <ChartTooltip
                                  content={
                                    <ChartTooltipContent
                                      nameKey="value"
                                      hideLabel
                                    />
                                  }
                                />
                                <Pie
                                  data={Object.entries(
                                    analyticsData.legalEntityDistribution || {}
                                  ).map(([name, value]) => ({ name, value }))}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  labelLine={false}
                                  label={({ payload, ...props }) => (
                                    <text
                                      cx={props.cx}
                                      cy={props.cy}
                                      x={props.x}
                                      y={props.y}
                                      textAnchor={props.textAnchor}
                                      dominantBaseline={props.dominantBaseline}
                                      fill="hsla(var(--foreground))"
                                    >
                                      {payload.value}
                                    </text>
                                  )}
                                >
                                  {Object.entries(
                                    analyticsData.legalEntityDistribution || {}
                                  ).map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={`hsl(var(--chart-${
                                        (index % 6) + 1
                                      }))`}
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                          </CardContent>
                          <CardFooter className="flex-col gap-2 text-sm">
                            <div className="leading-none text-muted-foreground">
                              Showing distribution of legal entity types across
                              startups
                            </div>
                          </CardFooter>
                        </Card>

                        {/* Additional Pie Chart - Current Startup Stage */}

                        <Card className="flex flex-col">
                          <CardHeader>
                            <CardTitle>Sector Distribution</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 pt-6">
                            <ChartContainer
                              config={{
                                ...Object.fromEntries(
                                  Object.keys(
                                    analyticsData.sectorDistribution || {}
                                  ).map((sector, index) => [
                                    sector,
                                    {
                                      label: sector,
                                      color: `hsl(var(--chart-${
                                        (index % 6) + 1
                                      }))`,
                                    },
                                  ])
                                ),
                              }}
                              className="mx-auto aspect-square max-h-[250px] px-0 [&_.recharts-pie-label-text]:fill-foreground"
                            >
                              <PieChart>
                                <ChartTooltip
                                  content={
                                    <ChartTooltipContent
                                      nameKey="value"
                                      hideLabel
                                    />
                                  }
                                />
                                <Pie
                                  data={Object.entries(
                                    analyticsData.sectorDistribution || {}
                                  ).map(([name, value], index) => ({
                                    name,
                                    value,
                                    fill: localColors[index % 6],
                                  }))}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  label={({ payload, ...props }) => (
                                    <text
                                      cx={props.cx}
                                      cy={props.cy}
                                      x={props.x}
                                      y={props.y}
                                      textAnchor={props.textAnchor}
                                      dominantBaseline={props.dominantBaseline}
                                      fill="hsla(var(--foreground))"
                                    >
                                      {payload.value}
                                    </text>
                                  )}
                                  labelLine={false}
                                />
                              </PieChart>
                            </ChartContainer>
                          </CardContent>
                          <CardFooter className="flex-col gap-2 text-sm">
                            <div className="leading-none text-muted-foreground">
                              Showing distribution of startups by sector
                            </div>
                          </CardFooter>
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
