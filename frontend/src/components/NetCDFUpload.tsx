import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Clock,
  HardDrive,
} from "lucide-react";

interface UploadProgress {
  dataset_id: string;
  filename: string;
  status: "uploading" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  metadata?: {
    variables?: string[];
    dimensions?: any;
    value_count?: number;
    embedding_count?: number;
  };
}

interface NetCDFUploadProps {
  onUploadComplete?: () => void;
}

const NetCDFUpload: React.FC<NetCDFUploadProps> = ({ onUploadComplete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const netcdfFile = files.find((file) => file.name.endsWith(".nc"));

    if (netcdfFile) {
      setSelectedFile(netcdfFile);
      setError("");
    } else {
      setError("Please select a valid NetCDF (.nc) file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".nc")) {
        setSelectedFile(file);
        setError("");
      } else {
        setError("Please select a valid NetCDF (.nc) file");
      }
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload file
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

      // Try public endpoint first (for development), fallback to authenticated endpoint
      let uploadUrl = `${API_BASE_URL}/datasets/upload-netcdf-public/`;
      let headers: HeadersInit = {};

      // If we have a token, use the authenticated endpoint
      const token = localStorage.getItem("access_token");
      if (token) {
        uploadUrl = `${API_BASE_URL}/datasets/upload-netcdf/`;
        headers = {
          Authorization: `Bearer ${token}`,
        };
      }

      console.log("Uploading to:", uploadUrl);
      console.log("File:", selectedFile.name, "Size:", selectedFile.size);

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Upload error:", result);
        const errorMsg = result.error || result.detail || "Upload failed";
        const hint = result.hint ? `\n${result.hint}` : "";
        throw new Error(errorMsg + hint);
      }

      console.log("Upload success:", result);

      // Validate that the uploaded file has required structure
      if (!result.variables || !result.dimensions) {
        throw new Error("Invalid NetCDF file structure");
      }

      // Set initial upload progress
      setUploadProgress({
        dataset_id: result.dataset_id,
        filename: selectedFile.name,
        status: "processing",
        progress: 0,
        message: "Processing NetCDF file...",
        metadata: {
          variables: result.variables,
          dimensions: result.dimensions,
        },
      });

      // Start polling for status updates
      pollStatus(result.dataset_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const pollStatus = async (datasetId: string) => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/datasets/dataset-status/${datasetId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        const status = await response.json();

        if (status.status === "completed") {
          setUploadProgress({
            dataset_id: status.id,
            filename: status.filename,
            status: "completed",
            progress: 100,
            message: "Upload completed successfully!",
            metadata: {
              variables: status.variables,
              value_count: status.value_count,
              embedding_count: status.embedding_count,
            },
          });
          clearInterval(pollInterval);

          // Show success toast
          toast({
            title: "Upload Completed! 🎉",
            description: `${status.filename} has been processed successfully. ${
              status.value_count?.toLocaleString() || 0
            } data points and ${
              status.embedding_count || 0
            } embeddings created.`,
            duration: 5000,
          });

          // Trigger parent component refresh if callback provided
          if (onUploadComplete) {
            onUploadComplete();
          }
        } else if (status.status === "failed") {
          setUploadProgress({
            dataset_id: status.id,
            filename: status.filename,
            status: "failed",
            progress: 0,
            message: "Upload failed",
          });
          clearInterval(pollInterval);

          // Show error toast
          toast({
            title: "Upload Failed",
            description: `Processing of ${status.filename} failed. Please check the file and try again.`,
            variant: "destructive",
            duration: 5000,
          });
        } else if (status.status === "processing") {
          // Calculate progress based on data processing
          const progress = Math.min(
            90,
            ((status.value_count || 0) /
              Math.max(status.dimensions?.time?.size || 1000, 1)) *
              90
          );

          setUploadProgress({
            dataset_id: status.id,
            filename: status.filename,
            status: "processing",
            progress: progress,
            message: `Processing data... ${
              status.value_count || 0
            } values processed`,
            metadata: {
              variables: status.variables,
              value_count: status.value_count,
              embedding_count: status.embedding_count,
            },
          });
        }
      } catch (err) {
        console.error("Error polling status:", err);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 600000);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          NetCDF Data Upload
        </CardTitle>
        <CardDescription>
          Upload NetCDF files for processing and vector indexing (Admin only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        {!selectedFile && !uploadProgress && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag and drop your NetCDF file here
            </p>
            <p className="text-muted-foreground mb-4">
              or click to browse for files
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".nc"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Selected File Info */}
        {selectedFile && !uploadProgress && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Change
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-medium">{uploadProgress.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {uploadProgress.message}
                </p>
              </div>
              <Badge
                variant={
                  uploadProgress.status === "completed"
                    ? "default"
                    : uploadProgress.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {uploadProgress.status === "uploading" && (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                )}
                {uploadProgress.status === "processing" && (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                )}
                {uploadProgress.status === "completed" && (
                  <CheckCircle className="h-3 w-3 mr-1" />
                )}
                {uploadProgress.status === "failed" && (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {uploadProgress.status}
              </Badge>
            </div>

            {uploadProgress.status !== "failed" && (
              <Progress value={uploadProgress.progress} className="w-full" />
            )}

            {/* Metadata Display */}
            {uploadProgress.metadata && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                {uploadProgress.metadata.variables && (
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Variables</p>
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress.metadata.variables.length} found
                      </p>
                    </div>
                  </div>
                )}

                {uploadProgress.metadata.value_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Data Points</p>
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress.metadata.value_count.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {uploadProgress.metadata.embedding_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Embeddings</p>
                      <p className="text-xs text-muted-foreground">
                        {uploadProgress.metadata.embedding_count} generated
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploadProgress.status === "completed" && (
              <Button onClick={resetUpload} className="w-full">
                Upload Another File
              </Button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        {selectedFile && !uploadProgress && (
          <Button
            onClick={uploadFile}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload NetCDF File
              </>
            )}
          </Button>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Only NetCDF (.nc) files are supported</p>
          <p>• File must contain time, latitude, and longitude variables</p>
          <p>• Maximum file size: 100MB</p>
          <p>• Processing may take several minutes for large files</p>
          <p>• Only valid NetCDF files will be stored in the database</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetCDFUpload;
