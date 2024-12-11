// src/app/mobile/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import EnvironmentWidget from '@components/dashboard/widgets/EnvironmentWidget';
import ChartWidget from '@components/dashboard/widgets/EnvironmentChart';
import { sensorsService } from 'lib/services/sensor.service';
import type { SensorData } from 'lib/types/sensor';

interface ChartData {
    months: string[];
    tempData: number[];
    humidityData: number[];
    vpdData: number[];
    co2Data: number[];
  }

  interface ReadingData {
    time: string;
    temp: number;
    humidity: number;
    co2: number;
  }
  
export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
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
      try {
        const sensorsResponse = await sensorsService.getSensors();
        if (sensorsResponse.success && sensorsResponse.sensor?.[0]) {
          const currentSensor = sensorsResponse.sensor[0];
          const valuesResponse = await sensorsService.getSensorValues(currentSensor.sn);
          
          if (valuesResponse.success && valuesResponse.sensorvalue?.[0]) {
            const latestReading = valuesResponse.sensorvalue[0];
            const parsedData: SensorData = JSON.parse(latestReading.SENSORDATAJSON);
            setSensorData(parsedData);

            const readings = valuesResponse.sensorvalue
              .slice(0, 24)
              .map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
                const parsed = JSON.parse(reading.SENSORDATAJSON);
                return {
                  time: new Date(reading.CreateDateTime).toLocaleTimeString(),
                  temp: parsed.AirTemp,
                  humidity: parsed.AirHum,
                  co2: parsed.AirCO2
                };
              })
              .reverse();

            setChartData({
              months: readings.map((r: ReadingData) => r.time),
              tempData: readings.map((r: ReadingData) => r.temp),
              humidityData: readings.map((r: ReadingData) => r.humidity),
              vpdData: Array(readings.length).fill(23),
              co2Data: readings.map((r: ReadingData) => r.co2)
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch sensor data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <EnvironmentWidget sensorData={sensorData} error={error} />
      <ChartWidget data={chartData} />
    </div>
  );
}