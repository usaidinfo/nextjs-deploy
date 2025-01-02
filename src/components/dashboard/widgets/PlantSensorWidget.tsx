'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { SensorData, SensorValue } from 'lib/types/sensor';

const borderColors: Record<number, string> = {
  0: 'border-[rgb(107,47,209)]/50 shadow-[0_0_15px_rgba(107,47,209,0.2)]',
  1: 'border-[rgb(21,128,61)]/50 shadow-[0_0_15px_rgba(21,128,61,0.2)]',
  2: 'border-[rgb(214,57,57)]/50 shadow-[0_0_15px_rgba(214,57,57,0.2)]' 
};

interface PlantSensorWidgetProps {
  sensorData: SensorData | null;
  historicalData?: SensorValue[];
  error?: string | null;
  title?: string | null;
  soilType?: string;
}

interface MinMax {
  min: number;
  max: number;
}

const PlantSensorWidget: React.FC<PlantSensorWidgetProps> = ({ 
  sensorData, 
  historicalData = [], 
  error, 
  title,
  soilType = ''
}) => {

  const calculateMinMax = (key: keyof SensorData): MinMax => {
    if (!historicalData.length) return { min: 0, max: 0 };

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

  const getMetricsForSensorType = () => {
    if (!sensorData) return [];
    
    const sensorType = sensorData.SensorType;
    
    if (sensorType === 8) {
      switch(soilType?.toLowerCase()) {
        case 'organic':
          return [
            {
              label: 'Pore EC',
              value: sensorData.PoreEC || '0',
              unit: 'mS',
              key: 'PoreEC'
            },
            {
              label: 'VWC',
              value: sensorData.VWC || '0',
              unit: '%',
              key: 'VWC'
            },
            {
              label: 'Soil Temp',
              value: sensorData.SoilTemp || '0',
              unit: '°C',
              key: 'SoilTemp'
            }
          ];
        case 'coco':
          return [
            {
              label: 'Bulk EC',
              value: sensorData.BulkEC || '0',
              unit: 'mS',
              key: 'BulkEC'
            },
            {
              label: 'VWC Coco',
              value: sensorData.VWCCoco || '0',
              unit: '%',
              key: 'VWCCoco'
            },
            {
              label: 'Soil Temp',
              value: sensorData.SoilTemp || '0',
              unit: '°C',
              key: 'SoilTemp'
            }
          ];
        case 'stone':
          return [
            {
              label: 'Bulk EC',
              value: sensorData.BulkEC || '0',
              unit: 'mS',
              key: 'BulkEC'
            },
            {
              label: 'VWC Rock',
              value: sensorData.VWCRock || '0',
              unit: '%',
              key: 'VWCRock'
            },
            {
              label: 'Soil Temp',
              value: sensorData.SoilTemp || '0',
              unit: '°C',
              key: 'SoilTemp'
            }
          ];
        default:
          return [];
      }
    }
    
    if (sensorType === 15) {
      return [
        {
          label: 'Leaf Wtns',
          value: sensorData.LeafWetness || '0',
          unit: '%',
          key: 'LeafWetness'
        },
        {
          label: 'Leaf Temp',
          value: sensorData.LeafTemp || '0',
          unit: '°C',
          key: 'LeafTemp'
        }
      ];
    }
    
    if (sensorType === 16) {
      return [
        {
          label: 'VWC',
          value: sensorData.VWC || '0',
          unit: '%',
          key: 'VWC'
        }
      ];
    }

    return [];
  };

  const metrics = getMetricsForSensorType();

  if (!metrics.length || sensorData?.SensorType === 255) {
    return (
      <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 xl:w-2/5 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-zinc-400 mb-4">
          <img src="/cloud.png" alt="No Data" className="w-16 h-16 object-contain" />
        </div>
        <p className="text-zinc-400 text-2xl font-bold mb-2">No Sensor Connected</p>
        <p className="text-zinc-400 text-center">Connect a sensor to view plant data</p>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 xl:w-2/5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">{title || 'Plant Sensor'}</h2>
          <p className="text-white">current value</p>
        </div>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 py-8 gap-4 max-w-lg mx-auto">
        {metrics.map((metric, index) => {
          const minMax = calculateMinMax(metric.key as keyof SensorData);
          return (
            <Card
              key={metric.label}
              className={`w-full h-[110px] !bg-[rgba(24,24,27,0.2)] backdrop-blur-sm border ${
                borderColors[index % 3]
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
                      {Number(metric.value).toFixed(2)}
                      <span className="ml-1 text-lg">{metric.unit}</span>
                    </div>
                  </div>
                  <div className="w-[28.6%] flex flex-col justify-between divide-y divide-white/10">
                    <div className="text-slate-400 text-sm pb-1">
                      Highest:
                      <div className="text-xs text-white">
                        {minMax.max.toFixed(2)}
                        <span className="">{metric.unit}</span>
                      </div>
                    </div>
                    <div className="text-slate-400 pt-1">
                      Lowest:
                      <div className="text-xs text-white">
                        {minMax.min.toFixed(2)}
                        <span className="">{metric.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlantSensorWidget;