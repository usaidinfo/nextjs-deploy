// src/app/mobile/dashboard/[locationId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EnvironmentWidget from '@components/dashboard/widgets/EnvironmentWidget';
import ChartWidget, { ChartData } from '@components/dashboard/widgets/EnvironmentChart';
import { sensorsService } from 'lib/services/sensor.service';
import type { SensorData } from 'lib/types/sensor';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import { format } from 'date-fns';

interface ReadingData {
    time: string;
    temp: number;
    humidity: number;
    vpd: number;
    co2: number;
  }

export default function LocationDashboardPage() {
  const { locationId } = useParams();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData>({
    months: [],
    tempData: [],
    humidityData: [],
    vpdData: [],
    co2Data: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sensorsResponse = await sensorsService.getSensors();
        
        if (!sensorsResponse.success) {
          setError('Failed to fetch sensors');
          setSensorData(null);
          setIsLoading(false);
          return;
        }

        if (!sensorsResponse.sensor || sensorsResponse.sensor.length === 0) {
          setError('No sensors found');
          setSensorData(null);
          setIsLoading(false);
          return;
        }

        const locationSensor = sensorsResponse.sensor.find(
            (          sensor: { location_id: string | string[] | undefined; }) => sensor.location_id === locationId
        );

        if (!locationSensor) {
          setError('No sensor found for this location');
          setSensorData(null);
          setIsLoading(false);
          return;
        }

        const valuesResponse = await sensorsService.getSensorValues(locationSensor.sn);
        
        if (!valuesResponse.success) {
          setError('This sensor dont have any values');
          setSensorData(null);
          setIsLoading(false);
          return;
        }

        if (!valuesResponse.sensorvalue || valuesResponse.sensorvalue.length === 0) {
          setError('No sensor data available for this location');
          setSensorData(null);
          setIsLoading(false);
          return;
        }

        const latestReading = valuesResponse.sensorvalue[0];
        const parsedData: SensorData = JSON.parse(latestReading.SENSORDATAJSON);
        setSensorData(parsedData);

        const readings = valuesResponse.sensorvalue
          .slice(0, 24)
          .map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
            const parsed = JSON.parse(reading.SENSORDATAJSON);
            return {
              time: format(new Date(reading.CreateDateTime), 'HH:mm'),
              temp: parsed.AirTemp,
              humidity: parsed.AirHum,
              vpd: parsed.AirVPD,
              co2: parsed.AirCO2
            };
          })
          .reverse();

        setChartData({
          months: readings.map((r: { time: ReadingData; }) => r.time),
          tempData: readings.map((r: { temp: ReadingData; }) => r.temp),
          humidityData: readings.map((r: { humidity: ReadingData; }) => r.humidity),
          vpdData: readings.map((r: { vpd: ReadingData; }) => r.vpd),
          co2Data: readings.map((r: { co2: ReadingData; }) => r.co2)
        });
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch sensor data');
        setSensorData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (locationId) {
      fetchData();
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [locationId]);

  const handleDateRangeChange = async (startDate: Date, endDate: Date) => {
    if (!locationId) return;
    
    setIsLoading(true);
    try {
      const sensorsResponse = await sensorsService.getSensors();
      const locationSensor = sensorsResponse.sensor?.find(
        (        sensor: { location_id: string | string[]; }) => sensor.location_id === locationId
      );
  
      if (!locationSensor) {
        setError('No sensor found for this location');
        return;
      }
  
      const valuesResponse = await sensorsService.getSensorValues(
        locationSensor.sn,
        startDate,
        endDate
      );
  
      if (valuesResponse.success && valuesResponse.sensorvalue?.length > 0) {
        const readings = valuesResponse.sensorvalue.map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
          const parsed = JSON.parse(reading.SENSORDATAJSON);
          return {
            time: format(new Date(reading.CreateDateTime), 'MMM dd HH:mm'),
            temp: parsed.AirTemp,
            humidity: parsed.AirHum,
            vpd: parsed.AirVPD,
            co2: parsed.AirCO2
          };
        }).reverse();
  
        setChartData({
          months: readings.map((r: { time: ReadingData; }) => r.time),
          tempData: readings.map((r: { temp: ReadingData; }) => r.temp),
          humidityData: readings.map((r: { humidity: ReadingData; }) => r.humidity),
          vpdData: readings.map((r: { vpd: ReadingData; }) => r.vpd),
          co2Data: readings.map((r: { co2: ReadingData; }) => r.co2)
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch sensor data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 min-h-[400px]">
          <div className="animate-pulse">
            <div className="flex flex-col">
              <div className="h-7 w-32 bg-zinc-700/50 rounded mb-2" />
              <div className="h-5 w-24 bg-zinc-700/50 rounded mb-10" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="h-[110px] bg-[rgba(24,24,27,0.2)] backdrop-blur-sm border border-zinc-700/50 rounded-xl p-4"
                  >
                    <div className="flex gap-3 h-full">
                      <div className="w-[71.4%] border-r border-zinc-700/50 pr-4">
                        <div className="h-4 w-24 bg-zinc-700/50 rounded mb-4" /> 
                        <div className="h-8 w-20 bg-zinc-700/50 rounded mx-auto" />
                      </div>
                      <div className="w-[28.6%] flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="h-3 w-12 bg-zinc-700/50 rounded" />
                          <div className="h-3 w-8 bg-zinc-700/50 rounded" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 w-12 bg-zinc-700/50 rounded" />
                          <div className="h-3 w-8 bg-zinc-700/50 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
  
        <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 min-h-[400px]">
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 w-32 bg-zinc-700/50 rounded mb-2" />
                <div className="h-5 w-48 bg-zinc-700/50 rounded" />
              </div>
              <div className="h-8 w-8 bg-zinc-700/50 rounded-full" /> 
            </div>
            
            <div className="h-[300px] relative">
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-[1px] bg-zinc-700/30" />
                ))}
              </div>
              
              <div className="absolute inset-0 flex items-center">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="h-1/2 w-full bg-zinc-700/50 rounded"
                    style={{
                      transform: `translateY(${Math.sin(i) * 20}px)`,
                      opacity: 0.5 - i * 0.1
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 min-h-[400px] flex flex-col items-center justify-center">
          <div className="text-zinc-400 mb-4">
            <FindInPageIcon className="w-16 h-16" />
          </div>
          <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
          <p className="text-zinc-400 text-center">{error}</p>
        </div>
        <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 min-h-[400px] flex flex-col items-center justify-center">
          <div className="text-zinc-400 mb-4">
            <FindInPageIcon className="w-16 h-16" />
          </div>
          <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
          <p className="text-zinc-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EnvironmentWidget sensorData={sensorData} error={error} />
      <ChartWidget 
        data={chartData} 
        onDateRangeChange={handleDateRangeChange}
        isLoading={isLoading}
      />
    </div>
  );
}