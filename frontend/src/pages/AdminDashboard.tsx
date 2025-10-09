import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import NetCDFUpload from "@/components/NetCDFUpload";
import {
  Database,
  Users,
  Search,
  Bot,
  Activity,
  Upload,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  const { t } = useLanguage();

  // Mock admin data
  const systemStats = [
    {
      label: "Total Users",
      value: "1,247",
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Data Ingested (GB)",
      value: "892.4",
      icon: Database,
      color: "text-green-500",
    },
    {
      label: "Active Queries",
      value: "156",
      icon: Search,
      color: "text-purple-500",
    },
    { label: "System Load", value: "67%", icon: Cpu, color: "text-orange-500" },
  ];

  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  // Fetch recent uploads only when explicitly requested
  const fetchRecentUploads = async () => {
    setLoadingUploads(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${API_BASE_URL}/datasets/datasets/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match the expected format
        const transformedUploads = data.slice(0, 5).map((dataset: any) => ({
          file: dataset.filename,
          status:
            dataset.status === "completed"
              ? "Success"
              : dataset.status === "processing"
              ? "Processing"
              : dataset.status === "failed"
              ? "Failed"
              : "Uploaded",
          time: new Date(dataset.upload_time).toLocaleString(),
          records: dataset.value_count?.toLocaleString() || "0",
        }));
        setRecentUploads(transformedUploads);
      } else {
        console.error("Failed to fetch recent uploads");
      }
    } catch (error) {
      console.error("Error fetching recent uploads:", error);
    } finally {
      setLoadingUploads(false);
    }
  };

  const userActivity = [
    { user: "researcher@univ.edu", queries: 47, lastActive: "5 min ago" },
    { user: "marine.scientist@gov.org", queries: 32, lastActive: "15 min ago" },
    { user: "oceanographer@lab.com", queries: 28, lastActive: "1 hr ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Server className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t("dashboard.admin.title")}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage system resources, users, and data pipeline
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <Card
              key={index}
              className="bg-glass backdrop-blur-sm border-glass"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Data Management */}
          <Card className="bg-glass backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                {t("dashboard.admin.dataManagement")}
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>Recent ARGO data uploads and processing</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={fetchRecentUploads}
                  disabled={loadingUploads}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${
                      loadingUploads ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUploads ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading uploads...
                  </span>
                </div>
              ) : recentUploads.length === 0 ? (
                <div className="text-center py-4">
                  <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No uploads yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload your first NetCDF file to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUploads.map((upload, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {upload.file}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {upload.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            upload.status === "Success"
                              ? "default"
                              : upload.status === "Processing"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {upload.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {upload.records} records
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload NetCDF Data</DialogTitle>
                    <DialogDescription>
                      Upload and process NetCDF files for the oceanographic
                      database
                    </DialogDescription>
                  </DialogHeader>
                  <NetCDFUpload />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card className="bg-glass backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t("dashboard.admin.userManagement")}
              </CardTitle>
              <CardDescription>
                Active users and query statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userActivity.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {user.user}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.queries} queries today
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {user.lastActive}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-glass backdrop-blur-sm border-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t("dashboard.admin.systemMonitoring")}
              </CardTitle>
              <CardDescription>Real-time system health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <Badge variant="default">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">FAISS Index</span>
                  </div>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">AI Pipeline</span>
                  </div>
                  <Badge variant="secondary">Warning</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Storage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    67% used
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {t("dashboard.admin.queryMonitoring")}
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitor and analyze user queries
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Bot className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {t("dashboard.admin.modelManagement")}
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure LLM and embedding models
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-primary-glow mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                View usage patterns and insights
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass backdrop-blur-sm border-glass hover:shadow-ocean transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Server className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                System Config
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage system configuration
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
