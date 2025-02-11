'use client';
import React from 'react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';

export interface PlantChartData {
  months: string[];
  soilTempData: number[];
  bulkECData: number[];
  vwcRockData: number[];
  vwcData: number[];
  vwcCocoData: number[];
  poreECData: number[];
  leafWetnessData?: number[];
  leafTempData?: number[];
  vwcChannel1Data: number[];
  vwcChannel0Data: number[];
}

interface PlantSensorChartProps {
  data: PlantChartData;
  title?: string | null;
  sensorType?: number;
  soilType?: string;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
  currentDateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

interface ChartPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  label?: string;
}

const PlantSensorChart: React.FC<PlantSensorChartProps> = ({ 
  data, 
  title, 
  sensorType = 8,
  soilType = '',
  isLoading = false,
}) => {
  
  const chartColors = {
    soilTemp: 'rgba(214,57,57,1)',
    bulkEC: 'rgba(107,47,209,1)',
    vwcRock: 'rgba(21,128,61,1)',
    vwc: 'rgba(21,128,61,1)',
    vwc2: 'rgba(107,47,209,1)',
    vwcCoco: 'rgba(21,128,61,1)',
    poreEC: 'rgba(107,47,209,1)',
    leafWetness: 'rgba(107,47,209,1)',
    leafTemp: 'rgba(21,128,61,1)'
  };

  const getDisplayName = (key: string) => {
    const names: Record<string, string> = {
      soilTemp: 'Soil Temp',
      bulkEC: 'Bulk EC',
      vwcRock: 'VWC Rock',
      vwc: 'VWC',
      vwcCoco: 'VWC Coco',
      poreEC: 'Pore EC',
      leafWetness: 'Leaf Wetness',
      leafTemp: 'Leaf Temp'
    };
    return names[key] || key;
  };

  const getUnit = (key: string) => {
    const units: Record<string, string> = {
      soilTemp: '°C',
      bulkEC: 'mS/cm',
      vwcRock: '%',
      vwc: '%',
      vwcCoco: '%',
      poreEC: 'mS/cm',
      leafWetness: '',
      leafTemp: '°C'
    };
    return units[key] || '';
  };

  const getChartLines = () => {
    if (sensorType === 8) {
      switch(soilType?.toLowerCase()) {
        case 'soil':
          return [
            { key: 'poreEC', color: chartColors.poreEC },
            { key: 'vwc', color: chartColors.vwc },
            { key: 'soilTemp', color: chartColors.soilTemp }
          ];
        case 'coconut':
          return [
            { key: 'bulkEC', color: chartColors.bulkEC },
            { key: 'vwcCoco', color: chartColors.vwcCoco },
            { key: 'soilTemp', color: chartColors.soilTemp }
          ];
        case 'stone':
          return [
            { key: 'bulkEC', color: chartColors.bulkEC },
            { key: 'vwcRock', color: chartColors.vwcRock },
            { key: 'soilTemp', color: chartColors.soilTemp }
          ];
        default:
          return [];
      }
    }

    if (sensorType === 15) {
      return [
        { key: 'leafWetness', color: chartColors.leafWetness },
        { key: 'leafTemp', color: chartColors.leafTemp }
      ];
    }

    if (sensorType === 16) {
        return [{ key: 'vwcSensor', color: chartColors.vwc2 }];
    }

    if (sensorType === 17) {
      const hasChannel0 = data.vwcChannel0Data?.some(val => val !== undefined && val !== null);
      const hasChannel1 = data.vwcChannel1Data?.some(val => val !== undefined && val !== null);
      
      if (hasChannel0 || hasChannel1) {
        const lines = [];
        if (hasChannel0) {
          lines.push({ key: 'vwcChannel0Data', color: chartColors.vwc, label: 'VWC 1' });
        }
        if (hasChannel1) {
          lines.push({ key: 'vwcChannel1Data', color: chartColors.vwc2, label: 'VWC 2' });
        }
        return lines;
      }
    }

    return [];
  };

  const formatChartData = () => {
    return data.months.map((month, index) => ({
      time: month,
      poreEC: data.poreECData[index],
      bulkEC: data.bulkECData[index],
      vwcRock: data.vwcRockData[index],
      vwc: data.vwcData[index],
      vwcChannel0Data: data.vwcChannel0Data?.[index],
      vwcChannel1Data: data.vwcChannel1Data?.[index],
      vwcCoco: data.vwcCocoData[index],
      soilTemp: data.soilTempData[index],
      leafWetness: data.leafWetnessData?.[index],
      leafTemp: data.leafTempData?.[index],
      vwcSensor: data.vwcData[index]
    }));
  };
  

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg p-2">
          <p className="text-white text-sm font-medium mb-1">{label}</p>
          {payload.map((entry) => {
            const value = Number(entry.value);
            if (isNaN(value)) return null;
            
            return (
              <div 
                key={entry.dataKey} 
                className="flex justify-between text-sm gap-4"
              >
                <span style={{ color: entry.color }}>
                  {getDisplayName(entry.dataKey)}:
                </span>
                <span style={{ color: entry.color }}>
                  {value.toFixed(2)}
                  {getUnit(entry.dataKey)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const chartLines = getChartLines();
  const chartData = formatChartData();
  const hasData = chartData.length > 0 && chartLines.length > 0;

  return (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5 xl:w-3/5">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">{title || 'Plant Sensor Data'}</h2>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center text-white">
          Loading chart data...
        </div>
      ) : !hasData || chartLines.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-white">
          No data available for selected date range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={formatChartData()}
            margin={{ left: -20, right: 30, top: 20, bottom: 10 }}
          >
            <XAxis
              dataKey="time"
              stroke="#FFFFFF"
              tick={{ fill: 'white', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#FFFFFF"
              tick={{ fill: 'white', fontSize: 13 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <CartesianGrid
              horizontal={true}
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.5)"
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />
            {chartLines.map(line => (
              <Line
                key={line.key}
                type="monotoneX"
                dataKey={line.key}
                stroke={line.color}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PlantSensorChart;