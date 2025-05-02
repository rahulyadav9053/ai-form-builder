"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Optional: for debugging

export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize QueryClient only once per component lifecycle
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Global default options for queries
        // staleTime: 60 * 1000, // Example: data is considered fresh for 1 minute
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Optional: React Query DevTools for debugging */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
