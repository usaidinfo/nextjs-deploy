'use client';
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { SensorData, SensorValue } from 'lib/types/sensor';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';

const borderColors: Record<number, string> = {
    0: 'border-[rgb(214,57,57)]/50 shadow-[0_0_15px_rgba(214,57,57,0.2)]',    // Dark Red
    1: 'border-[rgb(107,47,209)]/50 shadow-[0_0_15px_rgba(107,47,209,0.2)]',  // Deep Purple
    2: 'border-[rgb(21,128,61)]/50 shadow-[0_0_15px_rgba(21,128,61,0.2)]',    // Forest Green
    3: 'border-[rgb(30,64,175)]/50 shadow-[0_0_15px_rgba(30,64,175,0.2)]',    // Royal Blue
    4: 'border-[rgb(202,138,4)]/50 shadow-[0_0_15px_rgba(202,138,4,0.2)]',    // Deep Gold
    5: 'border-[rgb(14,116,144)]/50 shadow-[0_0_15px_rgba(14,116,144,0.2)]'   // Dark Cyan
  };

interface PlantSensorWidgetProps {
  sensorData: SensorData | null;
  historicalData?: SensorValue[];
  error?: string | null;
  title?: string | null;
}

interface MinMax {
  min: number;
  max: number;
}

const PlantSensorWidget: React.FC<PlantSensorWidgetProps> = ({ 
  sensorData, 
  historicalData = [], 
  error, 
  title 
}) => {
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const calculateMinMax = (key: keyof SensorData): MinMax => {
    if (!historicalData.length) {
      return { min: 0, max: 0 };
    }

    const values = historicalData.map(reading => {
      const data: SensorData = JSON.parse(reading.SENSORDATAJSON);
      const value = data[key];
      return typeof value === 'string' ? parseFloat(value) : Number(value);
    }).filter(value => !isNaN(value));
    
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0
    };
  };

  const metrics = [
    {
      label: 'Soil Temp',
      value: sensorData?.SoilTemp || '0',
      unit: '°C',
      highest: calculateMinMax('SoilTemp').max.toFixed(1),
      lowest: calculateMinMax('SoilTemp').min.toFixed(1),
    },
    {
      label: 'Bulk EC',
      value: sensorData?.BulkEC || '0',
      unit: 'mS/cm',
      highest: calculateMinMax('BulkEC').max.toFixed(2),
      lowest: calculateMinMax('BulkEC').min.toFixed(2),
    },
    {
      label: 'VWC Rock',
      value: sensorData?.VWCRock || '0',
      unit: '%',
      highest: calculateMinMax('VWCRock').max.toFixed(2),
      lowest: calculateMinMax('VWCRock').min.toFixed(2),
    },
    {
      label: 'VWC',
      value: sensorData?.VWC || '0',
      unit: '%',
      highest: calculateMinMax('VWC').max.toFixed(2),
      lowest: calculateMinMax('VWC').min.toFixed(2),
    },
    {
      label: 'VWC Coco',
      value: sensorData?.VWCCoco || '0',
      unit: '%',
      highest: calculateMinMax('VWCCoco').max.toFixed(2),
      lowest: calculateMinMax('VWCCoco').min.toFixed(2),
    },
    {
      label: 'Pore EC',
      value: sensorData?.PoreEC || '0',
      unit: 'mS/cm',
      highest: calculateMinMax('PoreEC').max.toFixed(2),
      lowest: calculateMinMax('PoreEC').min.toFixed(2),
    }
  ];

  const displayedMetrics = showAllMetrics ? metrics : metrics.slice(0, 4);
  const hasMoreMetrics = metrics.length > 4;

  return (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 xl:w-2/5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">{title || 'Plant Sensor'}</h2>
          <p className="text-white">current value</p>
        </div>
        {hasMoreMetrics && (
          <button 
            onClick={() => setShowAllMetrics(!showAllMetrics)}
            className="text-white/70 hover:text-white flex items-center gap-1 text-sm"
          >
            {showAllMetrics ? (
              <>
                Show Less
                <ArrowCircleUpIcon className="w-5 h-5" />
              </>
            ) : (
              <>
                Show More
                <ArrowCircleDownIcon className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 py-8 gap-4 max-w-lg mx-auto">
        {displayedMetrics.map((metric, index) => (
          <Card
            key={metric.label}
            className={`w-full h-[110px] !bg-[rgba(24,24,27,0.2)] backdrop-blur-sm border ${
              borderColors[index]
            } !rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
            sx={{
              backgroundColor: 'rgba(24,24,27,0.2) !important',
              borderRadius: '0.75rem !important',
              boxShadow: '0 0 15px rgba(255,255,255,0.1) !important',
              backdropFilter: 'blur(8px)',
              '&.MuiCard-root': {
                backgroundColor: 'rgba(24,24,27,0.2) !important',
                borderRadius: '0.75rem !important'
              }
            }}
          >
            <CardContent className="h-full">
              <div className="flex gap-3 h-full">
                <div className="w-[71.4%] border-r border-white/10 pr-4">
                  <div className="font-bold mb-2 text-slate-400">{metric.label}</div>
                  <div className="text-2xl font-bold text-center text-white">
                    {metric.value}
                    <span className="ml-1 text-lg">{metric.unit}</span>
                  </div>
                </div>
                <div className="w-[28.6%] flex flex-col justify-between divide-y divide-white/10">
                  <div className="text-slate-400 text-sm pb-1">
                    Highest:
                    <div className="text-xs text-white">
                      {metric.highest}
                      <span className="">{metric.unit}</span>
                    </div>
                  </div>
                  <div className="text-slate-400 pt-1">
                    Lowest:
                    <div className="text-xs text-white">
                      {metric.lowest}
                      <span className="">{metric.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlantSensorWidget;