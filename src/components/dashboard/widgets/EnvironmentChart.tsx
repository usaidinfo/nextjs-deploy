import React, { useEffect, useMemo, useState } from 'react';
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

interface MetricConfig {
  name: string;
  color: string;
  unit: string;
  active: boolean;
  dataKey: keyof ChartData | string;
  scale: number;
}

interface ChartWidgetProps {
  data: ChartData;
  title?: string | null;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
  currentDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  firstSensorValueAt?: string;
  lastSensorValueAt?: string;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  stroke: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    stroke: string;
  }>;
  label?: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  data,
  title,
  onDateRangeChange,
  isLoading = false,
  currentDateRange,
  firstSensorValueAt,
  lastSensorValueAt
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setHours(new Date().getHours() - 4)),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [isOutOfRange, setIsOutOfRange] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [metrics, setMetrics] = useState<MetricConfig[]>([
    {
      name: 'Temperature',
      color: 'rgba(239,68,68,1)',
      unit: '°C',
      active: true,
      dataKey: 'temperature',
      scale: 1
    },
    {
      name: 'Humidity',
      color: 'rgba(34,197,94,1)',
      unit: '%',
      active: true,
      dataKey: 'humidity',
      scale: 1
    },
    {
      name: 'VPD',
      color: 'rgba(59,130,246,1)',
      unit: 'kPa',
      active: true,
      dataKey: 'vpd',
      scale: 1
    },
    {
      name: 'CO₂',
      color: 'rgba(234,179,8,1)',
      unit: 'ppm',
      active: true,
      dataKey: 'co2',
      scale: 0.1
    }
  ]);
  
  const toggleMetric = (index: number) => {
    setMetrics(prev => prev.map((metric, i) => 
      i === index ? { ...metric, active: !metric.active } : metric
    ));
  };

  const hasData = data.months.length > 0 && data.tempData.length > 0;

  const datePickerCustomStyles = {
    wrapper: 'bg-[rgba(24,24,27,0.9)] rounded-lg border border-zinc-700',
    calendar: 'text-white bg-transparent',
    dateDisplay: 'bg-transparent border-zinc-700',
    monthAndYear: 'text-white',
    weekDay: 'text-gray-400',
    button: 'hover:bg-zinc-700'
  };

  useEffect(() => {
    if (currentDateRange) {
      setDateRange([
        {
          startDate: currentDateRange.startDate,
          endDate: currentDateRange.endDate,
          key: 'selection'
        }
      ]);
    }
  }, [currentDateRange]);

  useEffect(() => {
    if (!currentDateRange && onDateRangeChange) {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setHours(endDate.getHours() - 4);
      onDateRangeChange(startDate, endDate);
    }
  }, [currentDateRange, onDateRangeChange]);

  // const formatChartData = () => {
  //   if (!data || !data.months) return [];
  //   return data.months.map((month, index) => ({
  //     time: month,
  //     temperature: data.tempData[index],
  //     humidity: data.humidityData[index],
  //     vpd: data.vpdData[index],
  //     co2: data.co2Data[index]
  //   }));
  // };

  const formattedChartData = useMemo(() => {
    if (!data || !data.months) return [];
    
    return data.months.map((month, index) => ({
      time: month,
      temperature: data.tempData?.[index] ?? 0,
      humidity: data.humidityData?.[index] ?? 0,
      vpd: data.vpdData?.[index] ?? 0,
      co2: data.co2Data?.[index] ?? 0
    }));
  }, [data])

  const handleQuickRangeSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const isValid = isDateRangeValid(startDate, endDate);
    if (!isValid) {
      setIsOutOfRange(true);
      return;
    }
  
    setDateRange([
      {
        startDate,
        endDate,
        key: 'selection'
      }
    ]);
    
    setShowDatePicker(false);
    
    if (onDateRangeChange) {
      endDate.setHours(23, 59, 59, 999);
      onDateRangeChange(startDate, endDate);
    }
  };

  const isDateRangeValid = (startDate: Date, endDate: Date) => {
    if (!firstSensorValueAt || !lastSensorValueAt) return true;
    
    const firstValue = new Date(firstSensorValueAt);
    const lastValue = new Date(lastSensorValueAt);
    
    return !(startDate > lastValue || endDate < firstValue);
  };

  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    if (!ranges.selection.startDate || !ranges.selection.endDate) return;

    const newStartDate = ranges.selection.startDate;
    const newEndDate = ranges.selection.endDate;
    const isValid = isDateRangeValid(newStartDate, newEndDate);
    setIsOutOfRange(!isValid);

    if (isMobile) {
      setTempDateRange([
        {
          startDate: newStartDate,
          endDate: newEndDate,
          key: 'selection'
        }
      ]);
    } else if (isValid) {
      setDateRange([
        {
          startDate: newStartDate,
          endDate: newEndDate,
          key: 'selection'
        }
      ]);
      setShowDatePicker(false);

      if (onDateRangeChange) {
        const endDate = new Date(newEndDate);
        endDate.setHours(23, 59, 59, 999);
        onDateRangeChange(newStartDate, endDate);
      }
    }
  };

  const handleApplyDateRange = () => {
    if (!tempDateRange[0].startDate || !tempDateRange[0].endDate) return;

    const isValid = isDateRangeValid(tempDateRange[0].startDate, tempDateRange[0].endDate);
    setIsOutOfRange(!isValid);

    if (isValid) {
      setDateRange(tempDateRange);
      setShowDatePicker(false);

      if (onDateRangeChange) {
        const endDate = new Date(tempDateRange[0].endDate);
        endDate.setHours(23, 59, 59, 999);
        onDateRangeChange(tempDateRange[0].startDate, endDate);
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/90 border border-zinc-700 rounded-lg p-2">
          <p className="text-white text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: TooltipPayload) => {
            const metric = metrics.find(m => m.dataKey === entry.dataKey);
            if (!metric || !metric.active) return null;
            
            return (
              <div key={metric.dataKey} className="flex justify-between text-sm gap-4">
                <span style={{ color: metric.color }}>
                  {metric.name}:
                </span>
                <span style={{ color: metric.color }}>
                  {(entry.value / metric.scale).toFixed(1)} {metric.unit}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const NoDataMessage = () => {
    if (isOutOfRange && firstSensorValueAt && lastSensorValueAt) {
      return (
        <div className="text-center">
          <p>Selected date range is outside available data range</p>
          <p className="text-sm text-gray-400 mt-2">
            Data available from {format(new Date(firstSensorValueAt), 'MMM dd, yyyy')} to{' '}
            {format(new Date(lastSensorValueAt), 'MMM dd, yyyy')}
          </p>
        </div>
      );
    }
    return (
      <div className="text-center">
        <p>No data available for selected date range</p>
        <p className="text-sm text-gray-400 mt-2">Try selecting a different date range</p>
      </div>
    );
  };

  return (
    <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5">
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">{title || 'Environment'}</h2>
          <p className="text-white text-sm">
            {format(dateRange[0].startDate, 'MMM dd, yyyy HH:mm')} -{' '}
            {format(dateRange[0].endDate, 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-4 ml-2 mr-1 overflow-x-auto hide-scrollbar">
          {metrics.map((metric, index) => (
            <button
              key={metric.name}
              onClick={() => toggleMetric(index)}
              aria-label={`Toggle ${metric.name} visibility`}
              className="flex items-center gap-2 transition-opacity"
              style={{ opacity: metric.active ? 1 : 0.3 }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <span className="text-xs text-white">{metric.name}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <CalendarIcon
            className="text-white/70 cursor-pointer hover:text-white transition-colors"
            onClick={() => setShowDatePicker(!showDatePicker)}
          />
          {showDatePicker && (
            <div className={isMobile ? 'fixed inset-0 flex items-center justify-center bg-black/50' : 'absolute right-0'} style={{ zIndex: 50 }}>
              <div className={`${datePickerCustomStyles.wrapper} ${isMobile ? 'w-[80vw] max-w-md mx-auto overflow-hidden' : ''}`}>
                <div className="flex flex-wrap gap-1.5 p-3 border-b border-zinc-700/50 bg-zinc-900/50">
                  <button
                    onClick={() => handleQuickRangeSelect(0.2)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/50 
                 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 hover:text-white 
                 transition-all duration-200"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleQuickRangeSelect(1)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/50 
                 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 hover:text-white 
                 transition-all duration-200"
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => handleQuickRangeSelect(7)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/50 
                 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 hover:text-white 
                 transition-all duration-200"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleQuickRangeSelect(30)}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/50 
                 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 hover:text-white 
                 transition-all duration-200"
                  >
                    Last 30 Days
                  </button>
                </div>
                <DateRange
                  ranges={isMobile ? tempDateRange : dateRange}
                  onChange={handleDateRangeChange}
                  months={1}
                  direction="horizontal"
                  className={datePickerCustomStyles.calendar}
                  rangeColors={['rgba(59,130,246,0.5)']}
                  color="rgba(59,130,246,1)"
                  minDate={firstSensorValueAt ? new Date(firstSensorValueAt) : undefined}
                  maxDate={lastSensorValueAt ? new Date(lastSensorValueAt) : undefined}
                />
                {isMobile && (
                  <div className="flex justify-end gap-2 p-2 border-t border-zinc-700 bg-[rgba(24,24,27,0.9)]">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-4 py-2 text-sm text-white bg-zinc-800 rounded-lg hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyDateRange}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {isOutOfRange && (
                  <div className="p-2 text-red-400 text-sm text-center">
                    Please select dates between{' '}
                    {format(new Date(firstSensorValueAt || ''), 'MMM dd, yyyy')} and{' '}
                    {format(new Date(lastSensorValueAt || ''), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center text-white">
          Loading chart data...
        </div>
      ) : !hasData || isOutOfRange ? (
        <div className="h-[300px] flex items-center justify-center text-white">
          <NoDataMessage />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formattedChartData}
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
                <Tooltip content={<CustomTooltip />} cursor={false} />
                {metrics.map(metric => metric.active && (
                  <Line
                    key={metric.dataKey}
                    type="monotoneX"
                    dataKey={metric.dataKey}
                    stroke={metric.color}
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

export default ChartWidget;