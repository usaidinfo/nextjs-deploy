'use client';
import React, { useEffect, useState } from 'react';
import { withAuth } from "lib/utils/auth";
import EnvironmentWidget from "@components/dashboard/widgets/EnvironmentWidget";
import ChartWidget from "@components/dashboard/widgets/EnvironmentChart";
import { sensorsService } from 'lib/services/sensor.service';
import type { MainSensorWithData, PlantSensorWithData, Sensor, SensorValue } from 'lib/types/sensor';
import type { MainReadingData, PlantReadingData } from 'lib/types/environment';
import { useParams } from 'next/navigation';
import { EnvironmentWidgetSkeleton } from '@components/dashboard/skeletons/EnvironmentWidgetSkeleton';
import { ChartWidgetSkeleton } from '@components/dashboard/skeletons/ChartWidgetSkeleton';
import { format } from 'date-fns';
import PlantSensorWidget from '@components/dashboard/widgets/PlantSensorWidget';
import PlantSensorChart from '@components/dashboard/widgets/PlantSensorChart';

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
  const [locationDevices, setLocationDevices] = useState<Sensor[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Sensor | null>(null);


  const fetchSensorData = async (sensorSN: string, startDate: Date, endDate: Date, isDateRangeSelected: boolean = false) => {
    const valuesResponse = await sensorsService.getSensorValues(sensorSN, startDate, endDate);
    
    if (!valuesResponse.success || !valuesResponse.sensorvalue?.length) {
      throw new Error('No sensor data available');
    }
  
    const allReadings = valuesResponse.sensorvalue.sort((a: SensorValue, b: SensorValue) => 
      new Date(b.CreateDateTime).getTime() - new Date(a.CreateDateTime).getTime()
    )
  
    const mostRecentReading = allReadings[0];
    const mostRecentTime = new Date(mostRecentReading.CreateDateTime);
    const fourHoursBeforeMostRecent = new Date(mostRecentTime.getTime() - (4 * 60 * 60 * 1000));
  
    const filteredReadings = isDateRangeSelected
      ? allReadings.filter((reading: { CreateDateTime: string | number | Date; }) => {
          const readingTime = new Date(reading.CreateDateTime);
          const rangeStartTime = new Date(startDate);
          rangeStartTime.setHours(0, 0, 0, 0);
          const rangeEndTime = new Date(endDate);
          rangeEndTime.setHours(23, 59, 59, 999);
          return readingTime >= rangeStartTime && readingTime <= rangeEndTime;
        })
      : allReadings.filter((reading: { CreateDateTime: string | number | Date; }) => {
          const readingTime = new Date(reading.CreateDateTime);
          return readingTime >= fourHoursBeforeMostRecent && readingTime <= mostRecentTime;
        });
  
    if (filteredReadings.length === 0) {
      throw new Error('No data available for selected time range');
    }
  
    const readings = filteredReadings
      .map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
        const parsed = JSON.parse(reading.SENSORDATAJSON);
        const readingDateTime = new Date(reading.CreateDateTime);
        
        return {
          time: format(readingDateTime, isDateRangeSelected ? 'MMM dd HH:mm' : 'HH:mm'),
          temp: parsed.AirTemp,
          humidity: parsed.AirHum,
          vpd: parsed.AirVPD,
          co2: parsed.AirCO2
        } as MainReadingData;
      })
      .sort((a: { time: string | number | Date; }, b: { time: string | number | Date; }) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .reverse()
      
    return {
      sensorData: JSON.parse(allReadings[0].SENSORDATAJSON),
      chartData: {
        months: readings.map((r: { time: MainReadingData; }) => r.time),
        tempData: readings.map((r: { temp: MainReadingData; }) => r.temp),
        humidityData: readings.map((r: { humidity: MainReadingData; }) => r.humidity),
        vpdData: readings.map((r: { vpd: MainReadingData; }) => r.vpd),
        co2Data: readings.map((r: { co2: MainReadingData; }) => r.co2)
      },
      historicalData: allReadings
    };
  };
  

  const fetchPlantSensorData = async (sensorSN: string, startDate: Date, endDate: Date, isDateRangeSelected: boolean = false) => {
    const valuesResponse = await sensorsService.getSensorValues(sensorSN, startDate, endDate);
    
    if (!valuesResponse.success || !valuesResponse.sensorvalue?.length) {
      throw new Error('No plant sensor data available');
    }
  
    const sortedReadings = valuesResponse.sensorvalue.sort((a: { CreateDateTime: string | number | Date; }, b: { CreateDateTime: string | number | Date; }) => 
      new Date(b.CreateDateTime).getTime() - new Date(a.CreateDateTime).getTime()
    );
  
    const validReadings = sortedReadings.filter((reading: { SENSORDATAJSON: string; }) => {
      const parsed = JSON.parse(reading.SENSORDATAJSON);
      return parsed.SensorType !== 255;
    });
  
    if (!validReadings.length) {
      throw new Error('No valid plant sensor data available');
    }
  
    const readings = validReadings.map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
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
        leafTemp: parsed.LeafTemp ?? 0
      };
    });
  
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
        leafTempData: readings.map((r: { leafTemp: PlantReadingData; }) => Number(r.leafTemp) || 0)
      },
      historicalData: validReadings
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
  
        const locationSensors = sensorsResponse.sensor?.filter(
          (sensor: { location_id: string; }) => sensor.location_id === locationId
        );
  
        if (!locationSensors?.length) {
          setError('No sensor found for this location');
          return;
        }
  
        setLocationDevices(locationSensors);
  
        let sensorData = null;
        let workingSensor = null;
        
        for (const sensor of locationSensors) {
          try {
            sensorData = await fetchSensorData(
              sensor.sn,
              currentDateRange.startDate,
              currentDateRange.endDate
            );
            workingSensor = sensor;
            break;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            continue;
          }
        }
  
        if (!sensorData || !workingSensor) {
          setError('No data available from any sensor in this location');
          return;
        }
  
        setSelectedDevice(workingSensor);
        setMainSensor({
          sensor: workingSensor,
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
      const interval = setInterval(fetchData, 600000);
      return () => clearInterval(interval);
    }
  }, [locationId, currentDateRange]);

  useEffect(() => {
    const fetchSelectedSensorData = async () => {
      if (!selectedDevice) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const sensorData = await fetchSensorData(
          selectedDevice.sn,
          currentDateRange.startDate,
          currentDateRange.endDate
        );
        
        setMainSensor({
          sensor: selectedDevice,
          ...sensorData
        });
      } catch (error) {
        setMainSensor(null);
        setError(error instanceof Error ? error.message : 'Failed to fetch sensor data');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSelectedSensorData();
  }, [selectedDevice]);

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
          ...sensorData,
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
      <div className="flex flex-col gap-6">
              {locationDevices.length > 1 && (
        <div className="flex justify-end px-4">
          <select
            value={selectedDevice?.sn || ''}
            onChange={(e) => {
              const device = locationDevices.find(d => d.sn === e.target.value);
              setSelectedDevice(device || null);
            }}
            className="bg-[rgba(24,24,27,0.5)] text-white border border-zinc-700 rounded-lg px-4 py-2"
          >
            {locationDevices.map((device, index) => (
              <option key={device.sn} value={device.sn}>
                LC Lite Device {index + 1} (SN: {device.sn})
              </option>
            ))}
          </select>
        </div>
      )}
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
      {locationDevices.length > 1 && (
        <div className="flex justify-end px-4">
          <select
            value={selectedDevice?.sn || ''}
            onChange={(e) => {
              const device = locationDevices.find(d => d.sn === e.target.value);
              setSelectedDevice(device || null);
            }}
            className="bg-[rgba(24,24,27,0.5)] text-white border border-zinc-700 rounded-lg px-4 py-2"
          >
            {locationDevices.map((device, index) => (
              <option key={device.sn} value={device.sn}>
                LC Lite Device {index + 1} (SN: {device.sn})
              </option>
            ))}
          </select>
        </div>
      )}
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
                title="Plant Environment"
                soilType={selectedPlantSensor.plantSoilType}
              />
              <PlantSensorChart 
                data={selectedPlantSensor.chartData}
                title="Plant Data"
                isLoading={isLoading}
                currentDateRange={currentDateRange}
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