// src/app/mobile/layout.tsx
'use client';
import '../globals.css'

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient">
      {children}
    </div>
  );
}