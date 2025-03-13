import React from 'react';
import { cn } from '../../lib/utils.js';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn('h-4 w-full', className)}
      {...props}
    />
  );
}

export function SkeletonCircle({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn('h-10 w-10 rounded-full', className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <Skeleton className="h-40" />
      <SkeletonText className="h-4 w-2/3" />
      <SkeletonText className="h-4 w-full" />
      <SkeletonText className="h-4 w-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className, ...props }: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="mb-4 flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonText key={i} className="h-6 flex-1" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonText key={colIndex} className="h-6 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
