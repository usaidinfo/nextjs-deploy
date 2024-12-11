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

interface ReadingData {
  time: string;
  temp: number;
  humidity: number;
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
        if (sensorsResponse.success && sensorsResponse.sensor && sensorsResponse.sensor.length > 0) {
          const currentSensor = sensorsResponse.sensor[0];

          const valuesResponse = await sensorsService.getSensorValues(currentSensor.sn);
          if (valuesResponse.success && valuesResponse.sensorvalue && valuesResponse.sensorvalue.length > 0) {
            const latestReading = valuesResponse.sensorvalue[0];
            const parsedData: SensorData = JSON.parse(latestReading.SENSORDATAJSON);
            setSensorData(parsedData);

            const readings = valuesResponse.sensorvalue.slice(0, 24).map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
              const parsed: SensorData = JSON.parse(reading.SENSORDATAJSON);
              return {
                time: new Date(reading.CreateDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: parsed.AirTemp,
                humidity: parsed.AirHum,
                co2: parsed.AirCO2
              };
            }).reverse();

            setChartData({
              months: readings.map((r: ReadingData) => r.time),
              tempData: readings.map((r: ReadingData) => r.temp),
              humidityData: readings.map((r: ReadingData) => r.humidity),
              vpdData: [23,23,23,24,24,23,25,25,25,23,23,23,21,21,20,20,20,23,23,25,25,27,27,28],
              co2Data: readings.map((r: ReadingData) => r.co2)
            });
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch sensor data');
      }  finally {
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

  if (!sensorData || isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="md:flex gap-3">
          <EnvironmentWidgetSkeleton />
          <ChartWidgetSkeleton />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="md:flex gap-3">
        <EnvironmentWidget sensorData={sensorData} error={error} />
        <ChartWidget data={chartData} />
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