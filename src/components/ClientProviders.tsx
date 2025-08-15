"use client";

import { useEffect, useState } from "react";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PerformanceMonitor from "@/components/PerformanceMonitor";

export function ClientProviders() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <PWAInstallPrompt />
      <PerformanceMonitor />
    </>
  );
}