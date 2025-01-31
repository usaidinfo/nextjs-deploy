// src/lib/optimize/fetchData.ts
import { sensorsService } from 'lib/services/sensor.service';
import { MainSensorWithData } from 'lib/types/sensor';
import fetchSensorData from './fetchSensorData';

export const fetchData = async (
  locationId: string | string[],
  currentDateRange: { startDate: Date; endDate: Date },
  setIsLoading: (isLoading: boolean) => void,
  setActiveSensor: (sn: string) => void,
  setMainSensor: (sensor: MainSensorWithData | null) => void,
  setError: (error: string | null) => void
) => {
  setIsLoading(true);
  try {
    const sensorsResponse = await sensorsService.getSensors();

    if (!sensorsResponse.success) {
      setError('Failed to fetch sensors');
      return;
    }

    const locationSensor = sensorsResponse.sensor?.find(
        (sensor: { location_id: string; }) => sensor.location_id == locationId
    );

    if (!locationSensor) {
      setError('No sensor found for this location');
      return;
    }

    setActiveSensor(locationSensor.sn);

    const sensorData = await fetchSensorData(
      locationSensor.sn,
      currentDateRange.startDate,
      currentDateRange.endDate
    );

    setMainSensor({
      sensor: locationSensor,
      ...sensorData,
    });
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to fetch sensor data');
  } finally {
    setIsLoading(false);
  }
};