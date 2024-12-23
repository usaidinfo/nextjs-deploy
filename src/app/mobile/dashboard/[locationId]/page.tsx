// src/app/mobile/dashboard/[locationId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EnvironmentWidget from '@components/dashboard/widgets/EnvironmentWidget';
import ChartWidget, { ChartData } from '@components/dashboard/widgets/EnvironmentChart';
import { sensorsService } from 'lib/services/sensor.service';
import type { SensorData, SensorValue } from 'lib/types/sensor';
import { format } from 'date-fns';
import PlantSensorChart, { PlantChartData } from '@components/dashboard/widgets/PlantSensorChart';
import PlantSensorWidget from '@components/dashboard/widgets/PlantSensorWidget';

interface ReadingData {
    time: string;
    temp: number;
    humidity: number;
    vpd: number;
    co2: number;
  }
  
  interface PlantReadingData {
    time: string;
    soilTemp: number;
    bulkEC: number;
    vwcRock: number;
    vwc: number;
    vwcCoco: number;
    poreEC: number;
  }

  interface PlantSelectedEvent {
    plantId: string;
    plantName: string;
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
  const [historicalData, setHistoricalData] = useState<SensorValue[]>([]);
  const [currentDateRange, setCurrentDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    endDate: new Date()
  });
  const [selectedPlantSensor, setSelectedPlantSensor] = useState<{
    sensorData: SensorData | null;
    historicalData: SensorValue[];
    chartData: PlantChartData;
  } | null>(null);

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
        
        if (valuesResponse.success && valuesResponse.sensorvalue) {
          const latestReading = valuesResponse.sensorvalue[0];
          const parsedData: SensorData = JSON.parse(latestReading.SENSORDATAJSON);
          setSensorData(parsedData);
          setHistoricalData(valuesResponse.sensorvalue);
        }

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
    const handlePlantSelected = async (e: Event) => {
      const event = e as CustomEvent<PlantSelectedEvent>;
      const plantId = event.detail.plantId;
      
      try {
        const sensorsResponse = await sensorsService.getSensors();
        const plantSensor = sensorsResponse.sensor?.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (          sensor: { in_plant_id: any; }) => sensor.in_plant_id === plantId
        );
  
        if (!plantSensor) {
          setSelectedPlantSensor(null);
          return;
        }
  
        const valuesResponse = await sensorsService.getSensorValues(
          plantSensor.sn,
          currentDateRange.startDate,
          currentDateRange.endDate
        );
  
        if (!valuesResponse.success || !valuesResponse.sensorvalue?.length) {
          setSelectedPlantSensor(null);
          return;
        }
  
        const readings = valuesResponse.sensorvalue.map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
          const parsed = JSON.parse(reading.SENSORDATAJSON);
          return {
            time: format(new Date(reading.CreateDateTime), 'HH:mm'),
            soilTemp: parsed.SoilTemp ?? 0,
            bulkEC: parsed.BulkEC ?? 0,
            vwcRock: parsed.VWCRock ?? 0,
            vwc: parsed.VWC ?? 0,
            vwcCoco: parsed.VWCCoco ?? 0,
            poreEC: parsed.PoreEC ?? 0
          };
        });
  
        setSelectedPlantSensor({
          sensorData: JSON.parse(valuesResponse.sensorvalue[0].SENSORDATAJSON),
          historicalData: valuesResponse.sensorvalue,
          chartData: {
            months: readings.map((r: { time: PlantReadingData; }) => r.time),
            soilTempData: readings.map((r: { soilTemp: PlantReadingData; }) => Number(r.soilTemp) || 0),
            bulkECData: readings.map((r: { bulkEC: PlantReadingData; }) => Number(r.bulkEC) || 0),
            vwcRockData: readings.map((r: { vwcRock: PlantReadingData; }) => Number(r.vwcRock) || 0),
            vwcData: readings.map((r: { vwc: PlantReadingData; }) => Number(r.vwc) || 0),
            vwcCocoData: readings.map((r: { vwcCoco: PlantReadingData; }) => Number(r.vwcCoco) || 0),
            poreECData: readings.map((r: { poreEC: PlantReadingData; }) => Number(r.poreEC) || 0)
          }
        });
      } catch (error) {
        console.error('Error fetching plant sensor:', error);
        setSelectedPlantSensor(null);
      }
    };
  
    window.addEventListener('plantSelected', handlePlantSelected);
    return () => window.removeEventListener('plantSelected', handlePlantSelected);
  }, [currentDateRange]);
  

  const handleDateRangeChange = async (startDate: Date, endDate: Date) => {
    setCurrentDateRange({ startDate, endDate });
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
        })
  
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
            <img 
                  src="/cloud.png" 
                  alt="No Data" 
                  className="w-16 h-16 object-contain"
                />
          </div>
          <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
          <p className="text-zinc-400 text-center">{error}</p>
        </div>
        <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 min-h-[400px] flex flex-col items-center justify-center">
          <div className="text-zinc-400 mb-4">
            <img 
                  src="/cloud.png" 
                  alt="No Data" 
                  className="w-16 h-16 object-contain"
                />
          </div>
          <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
          <p className="text-zinc-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
    <EnvironmentWidget
      sensorData={sensorData}
      historicalData={historicalData}
      error={error}
    />
    <ChartWidget 
      data={chartData} 
      onDateRangeChange={handleDateRangeChange}
      isLoading={isLoading}
      currentDateRange={currentDateRange}
    />

    {selectedPlantSensor && (
      <>
        <PlantSensorWidget 
          sensorData={selectedPlantSensor.sensorData}
          historicalData={selectedPlantSensor.historicalData}
          error={null}
          title="Plant Environment"
        />
        <PlantSensorChart 
          data={selectedPlantSensor.chartData}
          title="Plant Data"
          isLoading={isLoading}
          currentDateRange={currentDateRange}
        />
      </>
    )}
  </div>
  );
}