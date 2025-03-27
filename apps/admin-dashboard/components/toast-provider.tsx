"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ToastProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Toaster position="top-right" />;
} 