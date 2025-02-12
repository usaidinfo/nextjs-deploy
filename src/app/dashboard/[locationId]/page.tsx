// src/app/dashboard/[locationId]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { withAuth } from "lib/utils/auth";
import EnvironmentWidget from "@components/dashboard/widgets/EnvironmentWidget";
import ChartWidget from "@components/dashboard/widgets/EnvironmentChart";
import { sensorsService } from 'lib/services/sensor.service';
import type { MainSensorWithData, PlantSensorWithData } from 'lib/types/sensor';
import type { PlantReadingData } from 'lib/types/environment';
import { useParams } from 'next/navigation';
import { EnvironmentWidgetSkeleton } from '@components/dashboard/skeletons/EnvironmentWidgetSkeleton';
import { ChartWidgetSkeleton } from '@components/dashboard/skeletons/ChartWidgetSkeleton';
import { format } from 'date-fns';
import PlantSensorWidget from '@components/dashboard/widgets/PlantSensorWidget';
import PlantSensorChart from '@components/dashboard/widgets/PlantSensorChart';
import { useDeviceStore } from 'lib/store/deviceStore';
import fetchSensorData from 'lib/optimize/fetchSensorData';
import NoSensorConnected from '@components/dashboard/no-data-widgets/NoSensorConnected';
import CustomErrorWidget from '@components/dashboard/no-data-widgets/CustomErrorWidget';
import { fetchData } from 'lib/optimize/fetchData';

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
  const [currentDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    endDate: new Date()
  });
  const [displayDateRange, setDisplayDateRange] = useState({
    startDate: new Date(new Date().setHours(new Date().getHours() - 4)),
    endDate: new Date()
  });
  const setActiveSensor = useDeviceStore(state => state.setActiveSensor);
  const resetActiveItems = useDeviceStore(state => state.resetActiveItems);    
  

  const fetchPlantSensorData = async (sensorSN: string, startDate: Date, endDate: Date, isDateRangeSelected: boolean = false) => {
    const valuesResponse = await sensorsService.getSensorValues(sensorSN, startDate, endDate);
    
    if (!valuesResponse.success || !valuesResponse.sensorvalue?.length) {
      return {
        sensorData: null,
        chartData: {
          months: [],
          soilTempData: [],
          bulkECData: [],
          vwcRockData: [],
          vwcData: [],
          vwcCocoData: [],
          poreECData: [],
          leafWetnessData: [],
          leafTempData: [],
          vwcChannel0Data: [],
          vwcChannel1Data: []
        },
        historicalData: []
      };
    }
  
    const allReadings = valuesResponse.sensorvalue.sort((a: { CreateDateTime: string | number | Date; }, b: { CreateDateTime: string | number | Date; }) => 
      new Date(b.CreateDateTime).getTime() - new Date(a.CreateDateTime).getTime()
    );
  
    const validReadings = allReadings.filter((reading: { SENSORDATAJSON: string; }) => {
      const parsed = JSON.parse(reading.SENSORDATAJSON);
      return parsed.SensorType !== 255;
    });
  
    if (!validReadings.length) {
      throw new Error('No valid plant sensor data available');
    }
  
    const mostRecentReading = validReadings[0];
    const mostRecentTime = new Date(mostRecentReading.CreateDateTime);
    const fourHoursBeforeMostRecent = new Date(mostRecentTime.getTime() - (4 * 60 * 60 * 1000));
  
    const filteredReadings = isDateRangeSelected
      ? validReadings.filter((reading: { CreateDateTime: string | number | Date; }) => {
          const readingTime = new Date(reading.CreateDateTime);
          const rangeStartTime = new Date(startDate);
          rangeStartTime.setHours(0, 0, 0, 0);
          const rangeEndTime = new Date(endDate);
          rangeEndTime.setHours(23, 59, 59, 999);
          return readingTime >= rangeStartTime && readingTime <= rangeEndTime;
        })
      : validReadings.filter((reading: { CreateDateTime: string | number | Date; }) => {
          const readingTime = new Date(reading.CreateDateTime);
          return readingTime >= fourHoursBeforeMostRecent && readingTime <= mostRecentTime;
        });
  
    if (filteredReadings.length === 0) {
      throw new Error('No data available for selected time range');
    }
  
    const readings = filteredReadings
      .map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
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
          poreEC: parsed.PoreEC ?? 0,
          leafWetness: parsed.LeafWetness ?? 0,
          leafTemp: parsed.LeafTemp ?? 0,
          vwcChannel0Data: parsed.VWC_CHANNEL_0 ?? 0, 
          vwcChannel1Data: parsed.VWC_CHANNEL_1 ?? 0
        };
      })
      .sort((a: { time: string | number | Date; }, b: { time: string | number | Date; }) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .reverse()

  
    return {
      sensorData: JSON.parse(validReadings[0].SENSORDATAJSON),
      chartData: {
        months: readings.map((r: { time: PlantReadingData; }) => r.time),
        soilTempData: readings.map((r: { soilTemp: PlantReadingData; }) => Number(r.soilTemp) || 0),
        bulkECData: readings.map((r: { bulkEC: PlantReadingData; }) => Number(r.bulkEC) || 0),
        vwcRockData: readings.map((r: { vwcRock: PlantReadingData; }) => Number(r.vwcRock) || 0),
        vwcData: readings.map((r: { vwc: PlantReadingData; }) => Number(r.vwc) || 0),
        vwcCocoData: readings.map((r: { vwcCoco: PlantReadingData; }) => Number(r.vwcCoco) || 0),
        poreECData: readings.map((r: { poreEC: PlantReadingData; }) => Number(r.poreEC) || 0),
        leafWetnessData: readings.map((r: { leafWetness: PlantReadingData; }) => Number(r.leafWetness) || 0),
        leafTempData: readings.map((r: { leafTemp: PlantReadingData; }) => Number(r.leafTemp) || 0),
        vwcChannel0Data: readings.map((r: { vwcChannel0Data: PlantReadingData }) => Number(r.vwcChannel0Data) || 0),
        vwcChannel1Data: readings.map((r: { vwcChannel1Data: PlantReadingData }) => Number(r.vwcChannel1Data) || 0)
      },
      historicalData: validReadings
    };
  };

  useEffect(() => {
    if (locationId) {
      fetchData(
        locationId,
        currentDateRange,
        setIsLoading,
        setActiveSensor,
        setMainSensor,
        setError
      );
      const interval = setInterval(() => {
        fetchData(
          locationId,
          currentDateRange,
          setIsLoading,
          setActiveSensor,
          setMainSensor,
          setError
        );
      }, 600000);
      return () => clearInterval(interval);
      resetActiveItems();
    }
  }, [locationId, currentDateRange]);


  useEffect(() => {
    const handlePlantSelected = async (e: Event) => {
      const event = e as CustomEvent<PlantSelectedEvent>;
      const plantId = event.detail.plantId;
      const plantName = event.detail.plantName;
      
      try {
        const sensorsResponse = await sensorsService.getSensors();
        
        const plantSensor = sensorsResponse.sensor.find(
          (          sensor: { in_plant_id: string; plant_name: string; }) => sensor.in_plant_id === plantId && sensor.plant_name === plantName
        );
  
        if (!plantSensor) {
          setSelectedPlantSensor(null);
          return;
        }
  
        const baseSensorSN = plantSensor.sn;
  
        const allSensorEntries = sensorsResponse.sensor.filter(
          (          sensor: { sn: string; }) => sensor.sn === baseSensorSN
        );
  
        const sensorData = await fetchPlantSensorData(
          baseSensorSN,
          currentDateRange.startDate,
          currentDateRange.endDate
        );
  
        // Start with all channels null
        const modifiedSensorData = {
          ...sensorData.sensorData,
          VWC_CHANNEL_0: null,
          VWC_CHANNEL_1: null
        };
  
        const modifiedChartData = {
          ...sensorData.chartData,
          vwcChannel0Data: [],
          vwcChannel1Data: []
        };
  
        allSensorEntries.forEach((entry: { in_plant_id: string; sn_addonsensor_info: string; }) => {
          if (entry.in_plant_id === plantId) {
            const sensorInfo = entry.sn_addonsensor_info ? JSON.parse(entry.sn_addonsensor_info) : null;
            const channelField = sensorInfo?.SENSOR_VALUE_FIELD;
  
            if (channelField === 'VWC_CHANNEL_0') {
              modifiedSensorData.VWC_CHANNEL_0 = sensorData.sensorData?.VWC_CHANNEL_0;
              modifiedChartData.vwcChannel0Data = sensorData.chartData.vwcChannel0Data;
            }
            if (channelField === 'VWC_CHANNEL_1') {
              modifiedSensorData.VWC_CHANNEL_1 = sensorData.sensorData?.VWC_CHANNEL_1;
              modifiedChartData.vwcChannel1Data = sensorData.chartData.vwcChannel1Data;
            }
          }
        });
  
        setSelectedPlantSensor({
          sensor: plantSensor,
          sensorData: modifiedSensorData,
          chartData: modifiedChartData,
          historicalData: sensorData.historicalData,
          plantSoilType: plantSensor.plant_soiltype
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
    if (!mainSensor) return;
    setIsLoading(true);

    setDisplayDateRange({ startDate, endDate });
    
    try {
      const mainSensorData = await fetchSensorData(
        mainSensor.sensor.sn, 
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
      
    } catch (error: unknown) {
      if (error instanceof Error && !error.message.includes('No data available for selected time range')) {
        setError(error.message || 'Failed to fetch updated data');
      }
      setMainSensor(prev => prev);
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
      <CustomErrorWidget error={error}/>
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
          currentDateRange={displayDateRange}
          firstSensorValueAt={mainSensor.sensor.firstSensorValueAt}
          lastSensorValueAt={mainSensor.sensor.lastSensorValueAt}
        />
      </div>

      {selectedPlantSensor && (
        <div className="flex flex-col lg:flex-row gap-3">
          {!selectedPlantSensor.sensorData || selectedPlantSensor.sensorData.SensorType === 255 ? (
            <>
            <NoSensorConnected/>
            </>
          ) : (
            <>
              <PlantSensorWidget
                sensorData={selectedPlantSensor.sensorData}
                historicalData={selectedPlantSensor.historicalData}
                error={null}
                title="Plant Environment"
                soilType={selectedPlantSensor.plantSoilType}
              />
              <PlantSensorChart
                data={selectedPlantSensor.chartData}
                title="Plant Data"
                isLoading={isLoading}
                currentDateRange={displayDateRange}
                sensorType={selectedPlantSensor.sensorData?.SensorType}
                soilType={selectedPlantSensor.plantSoilType}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default withAuth(LocationPage);