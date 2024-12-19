'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { SensorData, SensorValue } from 'lib/types/sensor';

const borderColors: Record<number, string> = {
  0: 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  1: 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]',
  2: 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
  3: 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
};

interface EnvironmentWidgetProps {
  sensorData: SensorData | null;
  historicalData?: SensorValue[];
  error?: string | null;
  title?: string | null;
}

interface MinMax {
  min: number;
  max: number;
}

const EnvironmentWidget: React.FC<EnvironmentWidgetProps> = ({ 
  sensorData, 
  historicalData = [], 
  error, 
  title 
}) => {
  const calculateMinMax = (key: keyof SensorData): MinMax => {
    if (!historicalData.length) {
      return { min: 0, max: 0 };
    }

    const values = historicalData.map(reading => {
      const data: SensorData = JSON.parse(reading.SENSORDATAJSON);
      return Number(data[key]);
    }).filter(value => !isNaN(value));
    
    return {
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0
    };
  };

  const tempMinMax = calculateMinMax('AirTemp');
  const humMinMax = calculateMinMax('AirHum');
  const vpdMinMax = calculateMinMax('AirVPD');
  const co2MinMax = calculateMinMax('AirCO2');

  const metrics = [
    {
      label: 'Temperature',
      value: sensorData?.AirTemp.toFixed(1) || '0',
      unit: '°C',
      highest: tempMinMax.max.toFixed(1),
      lowest: tempMinMax.min.toFixed(1),
    },
    {
      label: 'Humidity',
      value: sensorData?.AirHum.toFixed(1) || '0',
      unit: '%',
      highest: humMinMax.max.toFixed(1),
      lowest: humMinMax.min.toFixed(1),
    },
    {
      label: 'VPD',
      value: sensorData?.AirVPD.toFixed(2) || '0',
      unit: 'kPa',
      highest: vpdMinMax.max.toFixed(2),
      lowest: vpdMinMax.min.toFixed(2),
    },
    {
      label: 'CO₂',
      value: sensorData?.AirCO2.toString() || '0',
      unit: 'ppm',
      highest: co2MinMax.max.toFixed(0),
      lowest: co2MinMax.min.toFixed(0),
    },
  ];

  return (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 xl:w-2/5">
      <h2 className="text-lg font-bold text-white">{title || 'Environment'}</h2>
      <p className="text-white pb-10">current value</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 pb-8 gap-4 max-w-lg mx-auto">
        {metrics.map((metric, index) => (
          <Card
            key={metric.label}
            className={`w-full h-[110px] !bg-[rgba(24,24,27,0.2)] backdrop-blur-sm border ${
              borderColors[index % 4]
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

export default EnvironmentWidget;