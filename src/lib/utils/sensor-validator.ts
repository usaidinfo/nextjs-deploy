import { sensorsService } from '../services/sensor.service';
import { SENSOR_PRODUCT_TYPES } from '../constants/sensor-types';
import type { Sensor, ProcessedSensorData, ValidationResult } from '../types/sensor';

export const validateAndProcessSensor = async (qrData: string): Promise<ValidationResult> => {
  try {
    const validation = await sensorsService.validateQRData(qrData);
    
    if (!validation.isValid || !validation.data) {
      return { success: false, error: validation.error || 'Invalid QR code' };
    }

    if (!validation.data.sensor_existing) {
      return { 
        success: true, 
        isExisting: false,
        data: {
          sn: validation.data.sn,
          type: validation.data.type,
          info: validation.data.info
        }
      };
    }

    const sensorsResponse = await sensorsService.getSensors();
    
    if (!sensorsResponse.success) {
      return { success: false, error: 'Failed to fetch sensor details' };
    }

    const lcliteSN = validation.data.sn;
    const matchingSensors = sensorsResponse.sensor.filter(
      (sensor: Sensor) => sensor.sn === lcliteSN
    );

    if (!matchingSensors.length) {
      return { success: false, error: 'Sensor not found in account' };
    }

    const locationDetails = {
      locationId: matchingSensors[0].location_id,
      locationName: matchingSensors[0].in_location
    };

    const connectedSensors = await Promise.all(
      matchingSensors
        .filter((sensor: { sn_addonsensor: string | null }) => sensor.sn_addonsensor)
        .map(async (sensor: { sn_addonsensor: string; plant_name: string | null; in_plant_id: number | null; plant_soiltype: string | null; }) => {
          if (!sensor.sn_addonsensor) return null;
          
          const addonInfo = await sensorsService.getSNInfo(sensor.sn_addonsensor);
          
          if (addonInfo.success && addonInfo.info?.[0]) {
            const productType = addonInfo.info[0].ProductTpye;
            return {
              sn: sensor.sn_addonsensor,
              type: SENSOR_PRODUCT_TYPES[productType] || 'Unknown Sensor',
              plantName: sensor.plant_name || undefined,
              plantId: sensor.in_plant_id || undefined,
              substrate: sensor.plant_soiltype || undefined
            };
          }
          return null;
        })
    );

    const validConnectedSensors = connectedSensors.filter((sensor): sensor is NonNullable<typeof sensor> => sensor !== null);

    return {
      success: true,
      isExisting: true,
      data: {
        deviceSN: lcliteSN,
        location: locationDetails,
        connectedSensors: validConnectedSensors
      } as ProcessedSensorData
    };

  } catch (error) {
    console.error('Error in validateAndProcessSensor:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};