// src/lib/utils/sensor-validation.ts
import { sensorsService } from '../services/sensor.service';
import { SENSOR_PRODUCT_TYPES, SENSOR_IMAGES, SensorType } from '../constants/sensor-types';
import type { ValidationResult } from '../types/sensor-validator';
import type { Sensor } from '../types/sensor';
import { useDeviceStore } from '../store/deviceStore';

interface MappedSensor {
    sn: string;
    type: SensorType;
    plantName?: string;
    plantId?: string;
    substrate?: string;
    image: string;
    measurements: string[];
    hasSubstrate: boolean;
  }

export const validateAndProcessQRCode = async (qrUrl: string): Promise<ValidationResult> => {
    try {
      const sn = qrUrl.split('/').pop() || '';
      const snValidation = await sensorsService.getSNInfo(sn);
      
      if (!snValidation.success || !snValidation.info?.[0]) {
        return { success: false, error: 'Invalid device' };
      }

      const snInfo = snValidation.info[0];

      if (snInfo.ProductTpye !== 'lclite') {
        return { success: false, error: 'Please scan a Leaf-Connect Lite device' };
      }
  
      if (!snValidation.sensor_existing) {
        return { 
          success: true, 
          isExisting: false, 
          deviceSN: snValidation.info[0].SN 
        };
      }
  
      const sensorsResponse = await sensorsService.getSensors();
      if (!sensorsResponse.success || !sensorsResponse.sensor) {
        return { success: false, error: 'Failed to fetch sensors' };
      }
  
      const mainDevice = sensorsResponse.sensor.find(
        (sensor: Sensor) => sensor.sn === snInfo.SN
      );
  
      if (!mainDevice) {
        return { success: false, error: 'Device not found in your account' };
      }
  
      const connectedSensors = await Promise.all(
        sensorsResponse.sensor
          .filter((sensor: Sensor) => 
            sensor.sn === snInfo.SN && sensor.sn_addonsensor
          )
          .map(async (sensor: Sensor) => {
            if (!sensor.sn_addonsensor) return null;
  
            const addonInfo = await sensorsService.getSNInfo(sensor.sn_addonsensor);
            if (!addonInfo.success || !addonInfo.info?.[0]) return null;
  
            const sensorType = SENSOR_PRODUCT_TYPES[addonInfo.info[0].ProductTpye];
            if (!sensorType) return null;
  
            return {
              sn: sensor.sn_addonsensor,
              type: sensorType,
              plantName: sensor.plant_name,
              inPlantId: sensor.in_plant_id,
              substrate: sensor.plant_soiltype
            };
          })
      );
  
      const validSensors = connectedSensors.filter((sensor): sensor is NonNullable<typeof sensor> => sensor !== null);
  
      return {
        success: true,
        isExisting: true,
        deviceInfo: {
          sn: mainDevice.sn,
          location: {
            location_id: mainDevice.location_id,
            location_name: mainDevice.in_location,
            id: Number(mainDevice.location_id)
          },
          connectedSensors: validSensors
        }
      };
  
    } catch (error) {
      console.error('Sensor validation error:', error);
      return { success: false, error: 'Failed to validate sensor' };
    }
  };

  export const setupDeviceState = (validation: ValidationResult) => {
    if (!validation.success || !validation.deviceInfo) return false;
  
    const { deviceInfo } = validation;
  
    const mappedSensors: MappedSensor[] = deviceInfo.connectedSensors.map(sensor => {
      const sensorType = sensor.type as SensorType;
      return {
        sn: sensor.sn,
        type: sensorType,
        plantName: sensor.plantName || undefined,
        plantId: sensor.inPlantId || undefined,
        substrate: sensor.substrate || undefined,
        image: SENSOR_IMAGES[sensorType] || '/sensor-default.png',
        measurements: [],
        hasSubstrate: Boolean(sensor.substrate)
      };
    });
  
    useDeviceStore.setState({
        deviceSN: deviceInfo.sn,
        selectedLocation: deviceInfo.location,
        sensors: mappedSensors
      });
  
    return true;
  };