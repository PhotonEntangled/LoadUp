"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Define StatusBadge correctly using imported Badge
export const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null;
  const statusLower = status.toLowerCase();
  return (
    // Use the imported Badge component
    <Badge
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full",
        statusLower === "processed" || statusLower === "delivered" || statusLower === "completed"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : statusLower === "in transit"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            : statusLower === "delayed" || statusLower === "exception" || statusLower === "error"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              : statusLower === "awaiting_status"
                ? "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
              : "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
      )}
    >
      {statusLower === 'awaiting_status' ? 'Awaiting Status' : status}
    </Badge>
  );
}; 