import React from 'react';
import { cn } from '../../lib/utils.js';

interface TimelineEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface ShipmentStatusTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function ShipmentStatusTimeline({ events, className }: ShipmentStatusTimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-medium">Shipment History</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200" />
        
        {/* Timeline events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Status dot */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white">
                <div 
                  className={cn(
                    'h-3 w-3 rounded-full',
                    getStatusColor(event.status)
                  )} 
                />
              </div>
              
              {/* Event content */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{event.status}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</span>
                </div>
                <p className="text-sm">{event.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'order placed':
    case 'order received':
      return 'bg-blue-500';
    case 'processing':
    case 'in transit':
      return 'bg-yellow-500';
    case 'out for delivery':
      return 'bg-purple-500';
    case 'delivered':
      return 'bg-green-500';
    case 'failed':
    case 'returned':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
} 