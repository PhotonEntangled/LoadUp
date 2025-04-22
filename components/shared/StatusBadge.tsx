import { cn } from "@/lib/utils";

// Helper component for status badges - Extracted from document-page.tsx
// Includes V0 dark mode overrides and styles
export function StatusBadge({ status }: { status: string }) {
  const statusLower = status?.toLowerCase();
  const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
  let colorClasses = "";

  switch (statusLower) {
    case "needs review":
    case "pending": // Added pending as an alias for needs review style
      colorClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      break;
    case "delayed":
      colorClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      break;
    case "in transit":
    case "processing": // Added processing as an alias for in transit style
      colorClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "completed":
    case "delivered": // Added delivered as an alias for completed style
    case "processed": // Added processed as an alias for completed style
      colorClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "error":
      colorClasses = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    case "mixed":
    default:
      colorClasses = "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300";
      break;
  }

  return (
    <span className={cn(baseClasses, colorClasses)}>
      {/* Capitalize first letter for display if needed, otherwise use original */} 
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
} 