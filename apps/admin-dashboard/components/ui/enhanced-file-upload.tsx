import { useCallback, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileIcon, FileSpreadsheetIcon, ImageIcon, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";

type FileWithPreview = {
  file: File;
  id: string;
  preview?: string;
  progress: number;
  error?: string;
  uploading: boolean;
  uploaded: boolean;
};

type FileUploadProps = {
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  onUpload?: (files: File[]) => void;
  className?: string;
};

export type FileUploadRef = {
  openFileDialog: () => void;
};

export const EnhancedFileUpload = forwardRef<FileUploadRef, FileUploadProps>(({
  accept = "image/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,text/plain",
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  onUpload,
  className,
}, ref) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose the openFileDialog method to parent components
  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      fileInputRef.current?.click();
    }
  }));

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
      const selectedFiles = Array.from(event.target.files || []);
      
      if (files.length + selectedFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} files`);
        return;
      }

      const newFiles = selectedFiles.map((file) => {
        // Check file size
        if (file.size > maxSize) {
          return {
            file,
            id: crypto.randomUUID(),
            progress: 0,
            error: `File too large (max ${(maxSize / (1024 * 1024)).toFixed(1)}MB)`,
            uploading: false,
            uploaded: false,
          };
        }

        // Create preview for images
        let preview = undefined;
        if (file.type.startsWith("image/")) {
          preview = URL.createObjectURL(file);
        }

        return {
          file,
          id: crypto.randomUUID(),
          preview,
          progress: 0,
          uploading: false,
          uploaded: false,
        };
      });

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload process for each file
      newFiles.forEach((fileWithPreview) => {
        if (!fileWithPreview.error) {
          simulateUpload(fileWithPreview.id);
        }
      });

      if (onUpload) {
        onUpload(selectedFiles);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [files.length, maxFiles, maxSize, onUpload]
  );

  const simulateUpload = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, uploading: true } : f))
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      
      if (progress >= 100) {
        clearInterval(interval);
        progress = 100;
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress, uploading: false, uploaded: true } : f
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 300);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
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

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange({ target: { files: e.dataTransfer.files } });
      }
    },
    [handleFileChange]
  );

  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getFileIcon = useCallback((fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (
      fileType.includes("excel") ||
      fileType.includes("spreadsheet") ||
      fileType.endsWith("xlsx") ||
      fileType.endsWith("xls")
    ) {
      return <FileSpreadsheetIcon className="h-5 w-5" />;
    } else {
      return <FileIcon className="h-5 w-5" />;
    }
  }, []);

  return (
    <div className={cn("w-full space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Shipping Documents</h3>
        <p className="text-sm text-gray-500">
          Supported formats: Images, Excel files, PDFs, and text files
        </p>
      </div>

      <Input
        type="file"
        accept={accept}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={maxFiles > 1}
      />

      <div
        onClick={handleBrowseFiles}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100",
          isDragging && "border-blue-500 bg-blue-50"
        )}
      >
        <div className="rounded-full bg-white p-3 shadow-sm">
          <Upload className="h-6 w-6 text-gray-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Click to select files</p>
          <p className="text-xs text-gray-500">
            or drag and drop files here
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Max {maxFiles} files, up to {(maxSize / (1024 * 1024)).toFixed(1)}MB each
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Uploaded Files ({files.length}/{maxFiles})</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((fileWithPreview) => (
              <div
                key={fileWithPreview.id}
                className="relative flex items-start gap-3 rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="flex-shrink-0">
                  {fileWithPreview.preview ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={fileWithPreview.preview}
                        alt={fileWithPreview.file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-200 bg-gray-100">
                      {getFileIcon(fileWithPreview.file.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate pr-6">
                      {fileWithPreview.file.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(fileWithPreview.id);
                      }}
                      className="absolute right-3 top-3 rounded-full p-1 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {(fileWithPreview.file.size / 1024).toFixed(1)} KB
                  </p>
                  
                  {fileWithPreview.error ? (
                    <p className="mt-1 text-xs text-red-500">
                      {fileWithPreview.error}
                    </p>
                  ) : (
                    <div className="mt-2">
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            fileWithPreview.uploaded
                              ? "bg-green-500"
                              : "bg-blue-500"
                          )}
                          style={{ width: `${fileWithPreview.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {fileWithPreview.uploaded
                            ? "Uploaded"
                            : fileWithPreview.uploading
                            ? "Uploading..."
                            : "Waiting..."}
                        </span>
                        <span className="text-gray-500">
                          {fileWithPreview.progress}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}); 