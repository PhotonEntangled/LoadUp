"use client";

import { useEffect, useState } from 'react';

export function ClientDate() {
  const [dateString, setDateString] = useState('');
  
  useEffect(() => {
    setDateString(new Date().toLocaleString());
    
    // Optional: Update the date every minute
    const interval = setInterval(() => {
      setDateString(new Date().toLocaleString());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <span>{dateString}</span>;
} 