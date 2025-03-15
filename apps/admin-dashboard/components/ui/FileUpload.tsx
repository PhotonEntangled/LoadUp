"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/hooks/use-toast";

interface FileUploadProps {
  type: "image" | "document" | "any";
  accept: string;
  placeholder: string;
  variant?: "default" | "outline";
  onFileChange: (file: File) => void;
  maxSizeMB?: number;
}

const FileUpload = ({
  type,
  accept,
  placeholder,
  variant = "default",
  onFileChange,
  maxSizeMB = 5
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const styles = {
    button:
      variant === "default"
        ? "bg-blue-50 border border-blue-200 text-blue-700"
        : "bg-white border border-gray-300 text-gray-700",
    placeholder: variant === "default" ? "text-blue-600" : "text-gray-500",
  };

  const onValidate = (file: File) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    
    if (file.size > maxSize) {
      toast({
        title: "File size too large",
        description: `Please upload a file that is less than ${maxSizeMB}MB in size`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onValidate(file)) {
      setFileName(file.name);
      
      // Simulate progress for better UX
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Call the callback after "upload" completes
      setTimeout(() => {
        onFileChange(file);
        toast({
          title: `File selected successfully`,
          description: `${file.name} is ready to be uploaded`,
        });
        clearInterval(interval);
        setProgress(100);
      }, 1000);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-md p-4 transition-colors hover:opacity-90",
          styles.button
        )}
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>

        <p className={cn("text-base", styles.placeholder)}>
          {fileName || placeholder}
        </p>
      </button>

      {progress > 0 && progress < 100 && (
        <div className="mt-2 w-full rounded-full bg-gray-200">
          <div 
            className="rounded-full bg-blue-600 p-0.5 text-center text-xs font-medium leading-none text-white" 
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 