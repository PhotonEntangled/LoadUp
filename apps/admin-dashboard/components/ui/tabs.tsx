import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';

interface TabsProps {
  tabs: {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
  }[];
  defaultTabId?: string;
  className?: string;
  tabListClassName?: string;
  tabPanelClassName?: string;
}

export function Tabs({
  tabs,
  defaultTabId,
  className,
  tabListClassName,
  tabPanelClassName,
}: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex border-b', tabListClassName)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTabId === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={cn('mt-4', tabPanelClassName)}>
        {tabs.find((tab) => tab.id === activeTabId)?.content}
      </div>
    </div>
  );
} 