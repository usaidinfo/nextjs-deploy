// src/app/dashboard/[locationId]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { withAuth } from "lib/utils/auth";
import EnvironmentWidget from "@components/dashboard/widgets/EnvironmentWidget";
import ChartWidget, { ChartData } from "@components/dashboard/widgets/EnvironmentChart";
import { sensorsService } from 'lib/services/sensor.service';
import type { SensorData } from 'lib/types/sensor';
import { useParams } from 'next/navigation';
import { EnvironmentWidgetSkeleton } from '@components/dashboard/skeletons/EnvironmentWidgetSkeleton';
import { ChartWidgetSkeleton } from '@components/dashboard/skeletons/ChartWidgetSkeleton';
import { format } from 'date-fns';
import FindInPageIcon from '@mui/icons-material/FindInPage';

interface ReadingData {
  time: string;
  temp: number;
  humidity: number;
  vpd: number;
  co2: number;
}

function LocationPage() {
  const { locationId } = useParams();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    months: [],
    tempData: [],
    humidityData: [],
    vpdData: [],
    co2Data: []
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  

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

        // If no sensors at all
        if (!sensorsResponse.sensor || sensorsResponse.sensor.length === 0) {
          setError('No sensors found');
          setSensorData(null);
          setIsLoading(false);
          return;
        }

        const locationSensor = sensorsResponse.sensor.find(
          (          sensor: { location_id: string | string[] | undefined; }) => sensor.location_id === locationId
        );

        // If no sensor for this location
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
              time: new Date(reading.CreateDateTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
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

  useEffect(() => {
    const handlePlantSelected = (event: CustomEvent) => {
      setSelectedPlant(event.detail.plantId);
    };

    window.addEventListener('plantSelected', handlePlantSelected as EventListener);
    return () => {
      window.removeEventListener('plantSelected', handlePlantSelected as EventListener);
    };
  }, []);

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
      <div className="flex flex-col gap-6">
        <div className="md:flex gap-3">
          <EnvironmentWidgetSkeleton />
          <ChartWidgetSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="md:flex gap-3">
          <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-zinc-400 mb-4">
              <FindInPageIcon className="w-16 h-16" />
            </div>
            <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
            <p className="text-zinc-400 text-center">{error}</p>
          </div>
          <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-zinc-400 mb-4">
              <FindInPageIcon className="w-16 h-16" />
            </div>
            <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
            <p className="text-zinc-400 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sensorData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="md:flex gap-3">
          <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 flex items-center justify-center min-h-[400px]">
          <div className="text-zinc-400 w-16 h-16 mb-4">
            <FindInPageIcon className="w-full h-full" />
          </div>
          <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
            <p className="text-white text-lg">No sensor data available</p>
          </div>
          <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5 flex items-center justify-center min-h-[400px]">
            <p className="text-white text-lg">No sensor data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="md:flex gap-3">
        <EnvironmentWidget sensorData={sensorData} error={error} />
        <ChartWidget 
        data={chartData} 
        onDateRangeChange={handleDateRangeChange}
        isLoading={isLoading}
      />
      </div>

      {selectedPlant && (
        <div className="md:flex gap-3">
          <EnvironmentWidget sensorData={sensorData} error={error} title={`Plant Environment`} />
          <ChartWidget data={chartData} title={`Plant Data`} />
        </div>
      )}
    </div>
  );
}

export default withAuth(LocationPage);