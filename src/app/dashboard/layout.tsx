'use client';
import React, { Suspense } from 'react';
import Navbar from "@components/dashboard/Header";
import Sidebar from "@components/dashboard/Sidebar";
import 'app/globals.css';

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen h-auto bg-gradient">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-3">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </div>
        <footer className="text-sm text-gray-400 p-4">
          &copy; 2024, Made with ❤️ by Team Leaf AI
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;