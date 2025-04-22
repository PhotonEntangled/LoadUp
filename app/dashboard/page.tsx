"use client"

import React from 'react';

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          This is the main dashboard page. Overview statistics and quick actions will be displayed here.
        </p>
        {/* Placeholder for dashboard widgets */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="h-32 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center">
            <span className="text-muted-foreground">Widget Placeholder</span>
          </div>
           <div className="h-32 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center">
            <span className="text-muted-foreground">Widget Placeholder</span>
          </div>
           <div className="h-32 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center">
            <span className="text-muted-foreground">Widget Placeholder</span>
          </div>
        </div>
      </div>
    </main>
  );
} 