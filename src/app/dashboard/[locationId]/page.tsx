'use client';
import React, { useEffect, useState } from 'react';
import { withAuth } from "lib/utils/auth";
import EnvironmentWidget from "@components/dashboard/widgets/EnvironmentWidget";
import ChartWidget, { ChartData } from "@components/dashboard/widgets/EnvironmentChart";
import { sensorsService } from 'lib/services/sensor.service';
import type { SensorData, Sensor, SensorValue } from 'lib/types/sensor';
import { useParams } from 'next/navigation';
import { EnvironmentWidgetSkeleton } from '@components/dashboard/skeletons/EnvironmentWidgetSkeleton';
import { ChartWidgetSkeleton } from '@components/dashboard/skeletons/ChartWidgetSkeleton';
import { format } from 'date-fns';
import PlantSensorWidget from '@components/dashboard/widgets/PlantSensorWidget';
import PlantSensorChart, { PlantChartData } from '@components/dashboard/widgets/PlantSensorChart';

interface MainReadingData {
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

interface PlantSensorWithData {
  sensor: Sensor;
  sensorData: SensorData | null;
  chartData: PlantChartData;
  historicalData: SensorValue[];
}

interface MainSensorWithData {
  sensor: Sensor;
  sensorData: SensorData | null;
  chartData: ChartData;
  historicalData: SensorValue[];
}

interface PlantSelectedEvent {
  plantId: string;
  plantName: string;
}


function LocationPage() {
  const { locationId } = useParams();
  const [mainSensor, setMainSensor] = useState<MainSensorWithData | null>(null);
  const [selectedPlantSensor, setSelectedPlantSensor] = useState<PlantSensorWithData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDateRange, setCurrentDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    endDate: new Date()
  });

  const fetchSensorData = async (sensorSN: string, startDate: Date, endDate: Date, isDateRangeSelected: boolean = false) => {
    const valuesResponse = await sensorsService.getSensorValues(sensorSN, startDate, endDate);
    
    if (!valuesResponse.success || !valuesResponse.sensorvalue?.length) {
      throw new Error('No sensor data available');
    }
  
    const readings = valuesResponse.sensorvalue.map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
      const parsed = JSON.parse(reading.SENSORDATAJSON);
      return {
        time: format(new Date(reading.CreateDateTime), 
          isDateRangeSelected ? 'MMM dd HH:mm' : 'HH:mm'
        ),
        temp: parsed.AirTemp,
        humidity: parsed.AirHum,
        vpd: parsed.AirVPD,
        co2: parsed.AirCO2
      };
    });
  
    readings.sort((a: { CreateDateTime: string | number | Date; }, b: { CreateDateTime: string | number | Date; }) => 
      new Date(b.CreateDateTime).getTime() - new Date(a.CreateDateTime).getTime()
    );
  
    return {
      sensorData: JSON.parse(valuesResponse.sensorvalue[0].SENSORDATAJSON),
      chartData: {
        months: readings.map((r: { time: MainReadingData; }) => r.time),
        tempData: readings.map((r: { temp: MainReadingData; }) => r.temp),
        humidityData: readings.map((r: { humidity: MainReadingData; }) => r.humidity),
        vpdData: readings.map((r: { vpd: MainReadingData; }) => r.vpd),
        co2Data: readings.map((r: { co2: MainReadingData; }) => r.co2)
      },
      historicalData: valuesResponse.sensorvalue
    };
  };

  const fetchPlantSensorData = async (sensorSN: string, startDate: Date, endDate: Date, isDateRangeSelected: boolean = false) => {
    const valuesResponse = await sensorsService.getSensorValues(
      sensorSN, 
      startDate, 
      endDate
    );
    
    if (!valuesResponse.success || !valuesResponse.sensorvalue?.length) {
      throw new Error('No plant sensor data available');
    }
  
    const readings = valuesResponse.sensorvalue.map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
      const parsed = JSON.parse(reading.SENSORDATAJSON);
      return {
        time: format(new Date(reading.CreateDateTime), 
          isDateRangeSelected ? 'MMM dd HH:mm' : 'HH:mm'
        ),
        soilTemp: parsed.SoilTemp ?? 0,
        bulkEC: parsed.BulkEC ?? 0,
        vwcRock: parsed.VWCRock ?? 0,
        vwc: parsed.VWC ?? 0,
        vwcCoco: parsed.VWCCoco ?? 0,
        poreEC: parsed.PoreEC ?? 0
      };
    });
  
    readings.sort((a: { CreateDateTime: string | number | Date; }, b: { CreateDateTime: string | number | Date; }) => 
      new Date(b.CreateDateTime).getTime() - new Date(a.CreateDateTime).getTime()
    );
  
    return {
      sensorData: JSON.parse(valuesResponse.sensorvalue[0].SENSORDATAJSON),
      chartData: {
        months: readings.map((r: { time: PlantReadingData; }) => r.time),
        soilTempData: readings.map((r: { soilTemp: PlantReadingData; }) => Number(r.soilTemp) || 0),
        bulkECData: readings.map((r: { bulkEC: PlantReadingData; }) => Number(r.bulkEC) || 0),
        vwcRockData: readings.map((r: { vwcRock: PlantReadingData; }) => Number(r.vwcRock) || 0),
        vwcData: readings.map((r: { vwc: PlantReadingData; }) => Number(r.vwc) || 0),
        vwcCocoData: readings.map((r: { vwcCoco: PlantReadingData; }) => Number(r.vwcCoco) || 0),
        poreECData: readings.map((r: { poreEC: PlantReadingData; }) => Number(r.poreEC) || 0)
      },
      historicalData: valuesResponse.sensorvalue
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sensorsResponse = await sensorsService.getSensors();
        
        if (!sensorsResponse.success) {
          setError('Failed to fetch sensors');
          return;
        }

        const locationSensor = sensorsResponse.sensor?.find(
          (          sensor: { location_id: string | string[] | undefined; }) => sensor.location_id === locationId
        );

        if (!locationSensor) {
          setError('No sensor found for this location');
          return;
        }

        const sensorData = await fetchSensorData(
          locationSensor.sn,
          currentDateRange.startDate,
          currentDateRange.endDate
        );

        setMainSensor({
          sensor: locationSensor,
          ...sensorData
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch sensor data');
      } finally {
        setIsLoading(false);
      }
    };

    if (locationId) {
      fetchData();
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [locationId, currentDateRange]);

  useEffect(() => {
    const handlePlantSelected = async (e: Event) => {
      const event = e as CustomEvent<PlantSelectedEvent>;
      const plantId = event.detail.plantId;
      
      try {
        const sensorsResponse = await sensorsService.getSensors();
        const plantSensor = sensorsResponse.sensor?.find(
          (          sensor: { in_plant_id: string; }) => sensor.in_plant_id === plantId
        );

        if (!plantSensor) {
          setSelectedPlantSensor(null);
          return;
        }

        const sensorData = await fetchPlantSensorData(
          plantSensor.sn,
          currentDateRange.startDate,
          currentDateRange.endDate
        );

        setSelectedPlantSensor({
          sensor: plantSensor,
          ...sensorData
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
    setIsLoading(true);
    
    try {
      const sensorsResponse = await sensorsService.getSensors();
      const locationSensor = sensorsResponse.sensor?.find(
        (        sensor: { location_id: string | string[] | undefined; }) => sensor.location_id === locationId
      );
  
      if (!locationSensor) {
        setError('No sensor found for this location');
        return;
      }
  
      const mainSensorData = await fetchSensorData(
        locationSensor.sn, 
        startDate,
        endDate,
        true
      );
      setMainSensor(prev => prev ? {
        ...prev,
        ...mainSensorData
      } : null);
  
      if (selectedPlantSensor) {
        const plantSensorData = await fetchPlantSensorData(
          selectedPlantSensor.sensor.sn,
          startDate,
          endDate,
          true 
        );
        setSelectedPlantSensor(prev => prev ? {
          ...prev,
          ...plantSensorData
        } : null);
      }
    } catch (error) {
      console.error('Error updating chart data:', error);
      setError('Failed to fetch updated data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <EnvironmentWidgetSkeleton />
          <ChartWidgetSkeleton />
        </div>
      </div>
    );
  }

  if (error || !mainSensor) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-zinc-400 mb-4">
              <img src="/cloud.png" alt="No Data" className="w-16 h-16 object-contain" />
            </div>
            <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
            <p className="text-zinc-400 text-center">{error}</p>
          </div>
          <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-zinc-400 mb-4">
              <img src="/cloud.png" alt="No Data" className="w-16 h-16 object-contain" />
            </div>
            <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
            <p className="text-zinc-400 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-3">
        <EnvironmentWidget 
          sensorData={mainSensor.sensorData}
          historicalData={mainSensor.historicalData}
          error={null}
        />
        <ChartWidget 
          data={mainSensor.chartData}
          onDateRangeChange={handleDateRangeChange}
          isLoading={isLoading}
          currentDateRange={currentDateRange}
        />
      </div>

      {selectedPlantSensor && (
        <div className="flex flex-col lg:flex-row gap-3">
          {!selectedPlantSensor.sensorData || selectedPlantSensor.sensorData.SensorType === 255 ? (
            <>
              <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-2/5 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-zinc-400 mb-4">
                  <img src="/cloud.png" alt="No Data" className="w-16 h-16 object-contain" />
                </div>
                <p className="text-zinc-400 text-2xl font-bold mb-2">No Data Found</p>
                <p className="text-zinc-400 text-center">No sensor connected to this plant</p>
              </div>
              <div className="bg-[rgba(24,24,27,0.2)] rounded-2xl backdrop-blur-sm border border-zinc-700 p-4 w-full lg:w-3/5 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-zinc-400 mb-4">
                  <img src="/cloud.png" alt="No Data" className="w-16 h-16 object-contain" />
                </div>
                <p className="text-zinc-400 text-2xl font-bold mb-2">No Chart Data</p>
                <p className="text-zinc-400 text-center">No sensor connected to this plant</p>
              </div>
            </>
          ) : (
            <>
              <PlantSensorWidget 
                sensorData={selectedPlantSensor.sensorData}
                historicalData={selectedPlantSensor.historicalData}
                error={null}
                title={`${selectedPlantSensor.sensor.plant_name} Environment`}
              />
              <PlantSensorChart
                data={selectedPlantSensor.chartData}
                title={`${selectedPlantSensor.sensor.plant_name} Data`}
                onDateRangeChange={handleDateRangeChange}
                isLoading={isLoading}
                currentDateRange={currentDateRange}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default withAuth(LocationPage);