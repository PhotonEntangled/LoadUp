import React, { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

type FileStatus = "idle" | "uploading" | "error" | "success";

type FileWithStatus = {
  file: File;
  id: string;
  progress: number;
  status: FileStatus;
  error?: string;
};

type FileUploadProps = {
  onUpload?: (files: File[]) => void;
  maxSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
  supportedFileTypes?: string[];
};

export function FileUpload({
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  className,
  supportedFileTypes = [
    "image/jpeg", 
    "image/png", 
    "image/gif", 
    "application/vnd.ms-excel", 
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ],
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (selectedFiles: File[]) => {
      const newFiles = selectedFiles
        .filter((file) => {
          // Check if file type is supported
          if (!supportedFileTypes.includes(file.type)) {
            return false;
          }
          
          // Check if file size is within limit
          if (file.size > maxSize) {
            return false;
          }
          
          // Check if we already have this file
          if (files.some((f) => f.file.name === file.name && f.file.size === file.size)) {
            return false;
          }
          
          return true;
        })
        .map((file) => ({
          file,
          id: Math.random().toString(36).substring(2, 9),
          progress: 0,
          status: "idle" as FileStatus,
        }));

      if (newFiles.length === 0) return;

      // Check if adding these files would exceed maxFiles
      if (files.length + newFiles.length > maxFiles) {
        // Only add files up to the max limit
        const availableSlots = maxFiles - files.length;
        const filesToAdd = newFiles.slice(0, availableSlots);
        
        setFiles((prev) => [...prev, ...filesToAdd]);
        simulateUpload(filesToAdd);
        onUpload?.(filesToAdd.map((f) => f.file));
      } else {
        setFiles((prev) => [...prev, ...newFiles]);
        simulateUpload(newFiles);
        onUpload?.(newFiles.map((f) => f.file));
      }
    },
    [files, maxFiles, maxSize, onUpload, supportedFileTypes]
  );

  // Simulate file upload with progress
  const simulateUpload = useCallback((filesToUpload: FileWithStatus[]) => {
    filesToUpload.forEach((fileWithStatus) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        
        if (progress >= 100) {
          clearInterval(interval);
          progress = 100;
          
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileWithStatus.id
                ? { ...f, progress: 100, status: "success" }
                : f
            )
          );
        } else {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileWithStatus.id
                ? { ...f, progress, status: "uploading" }
                : f
            )
          );
        }
      }, 300);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileChange(droppedFiles);
    },
    [handleFileChange]
  );

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return <FileSpreadsheet className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Shipping Documents</h3>
        <p className="text-sm text-gray-500">
          Supported formats: Images (JPG, PNG, GIF) for OCR and Excel files
        </p>
      </div>

      <Input
        type="file"
        accept={supportedFileTypes.join(",")}
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files || []);
          handleFileChange(selectedFiles);
          // Reset input value so the same file can be uploaded again if removed
          e.target.value = "";
        }}
        multiple={maxFiles > 1}
      />

      <div
        onClick={handleBrowseFiles}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex h-40 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100",
          isDragging && "border-primary-500 bg-primary-50",
          files.length >= maxFiles && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="rounded-full bg-white p-3 shadow-sm">
          <Upload className="h-6 w-6 text-gray-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {files.length >= maxFiles
              ? "Maximum files reached"
              : "Click to select or drag and drop"}
          </p>
          <p className="text-xs text-gray-500">
            {files.length >= maxFiles
              ? `Remove some files to upload more (max: ${maxFiles})`
              : `Upload shipping documents (${formatFileSize(maxSize)} max per file)`}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Uploaded Files ({files.length}/{maxFiles})</h4>
            {files.some(f => f.status === "uploading") && (
              <p className="text-xs text-gray-500">Uploading...</p>
            )}
          </div>
          <div className="space-y-2">
            {files.map((fileWithStatus) => (
              <div
                key={fileWithStatus.id}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                    {getFileIcon(fileWithStatus.file.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {fileWithStatus.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileWithStatus.file.size)}
                      </p>
                      {fileWithStatus.status === "uploading" && (
                        <p className="text-xs text-gray-500">
                          {fileWithStatus.progress}%
                        </p>
                      )}
                      {fileWithStatus.status === "error" && (
                        <p className="text-xs text-red-500">
                          {fileWithStatus.error || "Upload failed"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {fileWithStatus.status === "uploading" ? (
                    <div className="w-20">
                      <Progress value={fileWithStatus.progress} className="h-1.5" />
                    </div>
                  ) : fileWithStatus.status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : fileWithStatus.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : null}
                  <button
                    className="h-8 w-8 rounded-md p-0 hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(fileWithStatus.id);
                    }}
                  >
                    <X className="h-4 w-4 mx-auto" />
                    <span className="sr-only">Remove file</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 