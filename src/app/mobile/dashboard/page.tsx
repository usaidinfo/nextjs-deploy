// src/app/mobile/dashboard/page.tsx
'use client';

import SensorsIcon from '@mui/icons-material/Sensors';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 min-h-[400px] flex flex-col items-center justify-center">
        <SensorsIcon className="text-zinc-400 w-16 h-16 mb-4" />
        <p className="text-white text-lg font-medium mb-2">No Sensor Data</p>
        <p className="text-zinc-400 text-sm text-center">
          Select a location from the menu to view sensor data
        </p>
      </div>

      <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 min-h-[400px] flex flex-col items-center justify-center">
        <SensorsIcon className="text-zinc-400 w-16 h-16 mb-4" />
        <p className="text-white text-lg font-medium mb-2">No Chart Data</p>
        <p className="text-zinc-400 text-sm text-center">
          Select a location from the menu to view environmental data
        </p>
      </div>
    </div>
  );
}