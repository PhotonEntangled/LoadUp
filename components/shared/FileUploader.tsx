import { useState, useRef, ChangeEvent, FormEvent, useId, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

// --- TYPES --- 
interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // Size in bytes
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: string) => void;
  uploadEndpoint?: string; // NEW: Allow custom upload endpoint
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

// --- COMPONENT ---
export default function FileUploader({
  accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel', // Default to Excel files
  multiple = false,
  maxSize = 5 * 1024 * 1024, // Default max 5MB
  onUploadSuccess,
  onUploadError,
  uploadEndpoint = '/api/documents', // Default to /api/documents
  buttonText = 'Upload Files',
  variant = 'default',
  className = '',
}: FileUploaderProps) {
  // --- STATE ---
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [useAltEndpoint, setUseAltEndpoint] = useState(false); // NEW: Flag for alternate endpoint
  
  // --- REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- HOOKS ---
  const { toast } = useToast();
  const router = useRouter();
  const id = useId();
  
  // --- FUNCTIONS ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const fileList: File[] = [];
    let oversizedFiles = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxSize) {
        oversizedFiles++;
        continue;
      }
      
      fileList.push(file);
    }
    
    if (oversizedFiles > 0) {
      toast({
        title: 'File size exceeded',
        description: `${oversizedFiles} file(s) were too large and won't be uploaded. Maximum file size is ${maxSize / (1024 * 1024)}MB.`,
        variant: 'destructive'
      });
    }
    
    setSelectedFiles(fileList);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getActualEndpoint = useCallback(() => {
    // NEW: Logic to determine which endpoint to use
    return useAltEndpoint ? '/api/documents/alt-upload' : uploadEndpoint;
  }, [useAltEndpoint, uploadEndpoint]);
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Use first file for now (since multiple is optional)
      const file = selectedFiles[0];
      const endpoint = getActualEndpoint();
      
      console.log(`Attempting to POST file to ${endpoint}: ${file.name}`);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the file to the server
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      console.log(`Received response from ${endpoint}: ${response.status}`);
      
      // Handle response
      if (response.ok) {
        const result = await response.json();
        console.log('Server response:', result);
        
        // Display success message
        toast({
          title: 'Upload successful!',
          description: `File ${file.name} uploaded successfully.`,
        });
        
        // Clear selected files
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Call success callback if provided
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
        
        // Refresh client-side data
        router.refresh();
        
      } else {
        // Extract error message from response if possible
        let errorMessage = 'Upload failed.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // JSON parsing failed, use status text
          errorMessage = `Upload failed: ${response.statusText}`;
        }
        
        console.error('Error during file upload fetch:', new Error(errorMessage));
        
        // Display error message
        toast({
          title: 'Upload failed',
          description: errorMessage,
          variant: 'destructive'
        });
        
        // Call error callback if provided
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'File upload failed';
      
      // Display error message
      toast({
        title: 'Upload error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Call error callback if provided
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  // --- RENDER ---
  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor={`file-${id}`} className="sr-only">
            Select Files
          </Label>
          <Input
            id={`file-${id}`}
            type="file"
            ref={fileInputRef}
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col space-y-2">
            <Button 
              type="button" 
              variant={variant}
              onClick={triggerFileInput} 
              className="w-full"
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {buttonText}
            </Button>
            
            {/* NEW: Toggle for alternate endpoint */}
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="altEndpointToggle"
                checked={useAltEndpoint}
                onChange={e => setUseAltEndpoint(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="altEndpointToggle" className="text-sm text-gray-600">
                Use alternate upload method (direct SQL)
              </label>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="text-sm text-gray-500">
                {selectedFiles.length} file(s) selected
              </div>
            )}
          </div>
          
          {selectedFiles.length > 0 && (
            <Button 
              type="submit" 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Selected Files'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
} 