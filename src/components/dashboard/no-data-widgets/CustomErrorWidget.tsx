// src/components/dashboard/no-data-widgets/CustomErrorWidget
import React from 'react'

interface CustomErrorWidgetProps {
    error: string | null;
  }

function CustomErrorWidget({ error }: CustomErrorWidgetProps) {
    return (
      <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-zinc-400 mb-4">
            <img src="/cloud.png" alt="No Data" className="w-16 h-16 object-contain" />
          </div>
          <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
          <p className="text-zinc-400 text-center">{error}</p>
        </div>
        <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-zinc-400 mb-4">
            <img src="/cloud.png" alt="No Data" className="w-16 h-16 object-contain" />
          </div>
          <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
          <p className="text-zinc-400 text-center">{error}</p>
        </div>
      </div>
    </div>
    )
  }

export default CustomErrorWidget;
