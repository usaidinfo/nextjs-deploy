import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { RangeKeyDict } from 'react-date-range';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';

export interface ChartData {
  months: string[];
  tempData: number[];
  humidityData: number[];
  vpdData: number[];
  co2Data: number[];
}

interface ChartWidgetProps {
  data: ChartData;
  title?: string | null;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
}

interface ChartPayloadEntry {
  name: 'temperature' | 'humidity' | 'vpd' | 'co2';
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  label?: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ 
  data, 
  title, 
  onDateRangeChange,
  isLoading = false 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const chartColors = {
    temperature: 'rgba(239,68,68,1)',
    humidity: 'rgba(34,197,94,1)',
    vpd: 'rgba(59,130,246,1)',
    co2: 'rgba(234,179,8,1)'
  };

  const hasData = data.months.length > 0 && data.tempData.length > 0;

  const datePickerCustomStyles = {
    wrapper: "bg-[rgba(24,24,27,0.9)] rounded-lg border border-zinc-700",
    calendar: "text-white bg-transparent",
    dateDisplay: "bg-transparent border-zinc-700",
    monthAndYear: "text-white",
    weekDay: "text-gray-400",
    button: "hover:bg-zinc-700"
  };

  const formatChartData = () => {
    return data.months.map((month, index) => ({
      time: month,
      temperature: data.tempData[index],
      humidity: data.humidityData[index],
      vpd: data.vpdData[index],
      co2: data.co2Data[index]
    }));
  };

  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    const newRange = [{
      startDate: ranges.selection.startDate || new Date(),
      endDate: ranges.selection.endDate || new Date(),
      key: 'selection'
    }];
    setDateRange(newRange);
    
    if (onDateRangeChange && ranges.selection.startDate && ranges.selection.endDate) {
      onDateRangeChange(ranges.selection.startDate, ranges.selection.endDate);
    }
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg p-2">
          <p className="text-white text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: ChartPayloadEntry) => (
            <div 
              key={entry.name} 
              className="flex justify-between text-sm gap-4"
            >
              <span style={{ color: entry.color }}>
                {entry.name === 'temperature' ? 'Temperature' :
                 entry.name === 'humidity' ? 'Humidity' :
                 entry.name === 'vpd' ? 'VPD' : 'CO2'}:
              </span>
              <span style={{ color: entry.color }}>
                {entry.value.toFixed(1)}
                {entry.name === 'temperature' ? '°C' :
                 entry.name === 'humidity' ? '%' :
                 entry.name === 'vpd' ? 'kPa' : 'ppm'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">{title || 'Environment'}</h2>
          <p className="text-white text-sm">
            {format(dateRange[0].startDate, 'MMM dd, yyyy')} - {format(dateRange[0].endDate, 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="relative">
          <CalendarIcon 
            className="text-white/70 cursor-pointer hover:text-white transition-colors"
            onClick={() => setShowDatePicker(!showDatePicker)}
          />
          {showDatePicker && (
            <div className="absolute right-0 z-10">
              <div className={datePickerCustomStyles.wrapper}>
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  months={1}
                  direction="horizontal"
                  className={datePickerCustomStyles.calendar}
                  rangeColors={['rgba(59,130,246,0.5)']}
                  color="rgba(59,130,246,1)"
                />
              </div>
            </div>
          )}
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
              dataKey="temperature"
              stroke={chartColors.temperature}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="humidity"
              stroke={chartColors.humidity}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="vpd"
              stroke={chartColors.vpd}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotoneX"
              dataKey="co2"
              stroke={chartColors.co2}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ChartWidget;