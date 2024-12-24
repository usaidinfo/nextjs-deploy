'use client';
import React from 'react';
import { format } from 'date-fns';
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
}

interface PlantSensorChartProps {
  data: PlantChartData;
  title?: string | null;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
  currentDateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

interface ChartPayloadEntry {
  name: 'soilTemp' | 'bulkEC' | 'vwcRock' | 'vwc' | 'vwcCoco' | 'poreEC';
  value: number;
  color: string;
//   eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataKey: any
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  label?: string;
}

const PlantSensorChart: React.FC<PlantSensorChartProps> = ({ 
  data, 
  title, 
  isLoading = false,
  currentDateRange
}) => {


    const chartColors = {
        soilTemp: 'rgba(214,57,57,1)',      // Dark Red
        bulkEC: 'rgba(107,47,209,1)',       // Deep Purple
        vwcRock: 'rgba(21,128,61,1)',       // Forest Green
        vwc: 'rgba(30,64,175,1)',           // Royal Blue  
        vwcCoco: 'rgba(202,138,4,1)',       // Deep Gold
        poreEC: 'rgba(14,116,144,1)'        // Dark Cyan
      };

  const hasData = data.months.length > 0;


  const formatChartData = () => {
    return data.months.map((month, index) => ({
      time: month,
      soilTemp: data.soilTempData[index],
      bulkEC: data.bulkECData[index],
      vwcRock: data.vwcRockData[index],
      vwc: data.vwcData[index],
      vwcCoco: data.vwcCocoData[index],
      poreEC: data.poreECData[index]
    }));
  };


  const getUnit = (name: string) => {
    switch(name) {
      case 'soilTemp': return '°C';
      case 'bulkEC':
      case 'poreEC': return 'mS/cm';
      case 'vwcRock':
      case 'vwc':
      case 'vwcCoco': return '%';
      default: return '';
    }
  };

  const getDisplayName = (name: string) => {
    switch(name) {
      case 'soilTemp': return 'Soil Temp';
      case 'bulkEC': return 'Bulk EC';
      case 'vwcRock': return 'VWC Rock';
      case 'vwc': return 'VWC';
      case 'vwcCoco': return 'VWC Coco';
      case 'poreEC': return 'Pore EC';
      default: return name;
    }
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg p-2">
          <p className="text-white text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: ChartPayloadEntry) => {
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

  return (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5 xl:w-3/5">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">{title || 'Plant Sensor Data'}</h2>
          <p className="text-white text-sm">
          {format(currentDateRange?.startDate || new Date(), 'MMM dd, yyyy')} - 
          {format(currentDateRange?.endDate || new Date(), 'MMM dd, yyyy')}          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center text-white">
          Loading chart data...
        </div>
      ) : !hasData ? (
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
            <Line
              type="monotoneX"
              dataKey="soilTemp"
              stroke={chartColors.soilTemp}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="bulkEC"
              stroke={chartColors.bulkEC}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="vwcRock"
              stroke={chartColors.vwcRock}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="vwc"
              stroke={chartColors.vwc}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="vwcCoco"
              stroke={chartColors.vwcCoco}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="poreEC"
              stroke={chartColors.poreEC}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PlantSensorChart;