// src/app/dashboard/page.tsx
'use client';
import { withAuth } from "lib/utils/auth";

function DashboardPage() {
  return (
    <div className="flex items-center justify-center h-full text-white">
      <h1 className="text-2xl">Select a location to view details</h1>
    </div>
  );
}

export default withAuth(DashboardPage);