"use client";

import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT } from "@/lib/toast-bus";

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handle(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      setMessage(detail);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMessage(null), 2500);
    }

    window.addEventListener(TOAST_EVENT, handle);
    return () => {
      window.removeEventListener(TOAST_EVENT, handle);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="toast fixed bottom-6 right-6 z-50 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-indigo-500">
      {message}
    </div>
  );
}
