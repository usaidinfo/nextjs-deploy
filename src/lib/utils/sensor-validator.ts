// src/lib/utils/sensor-validation.ts
import { sensorsService } from '../services/sensor.service';
import { SENSOR_PRODUCT_TYPES, SENSOR_IMAGES } from '../constants/sensor-types';
import type { ValidationResult, ValidatedSensor } from '../types/sensor-validator';
import type { Sensor } from '../types/sensor';
import { useDeviceStore } from '../store/deviceStore';

export const validateAndProcessQRCode = async (qrUrl: string): Promise<ValidationResult> => {
  try {
    const snValidation = await sensorsService.validateQRData(qrUrl);
    
    if (!snValidation.isValid || !snValidation.data) {
        return { success: false, error: snValidation.error || 'Invalid QR code' };
      }

    // If sensor doesn't exist, return basic validation
    if (!snValidation.data.sensor_existing) {
        return { 
          success: true,
          isExisting: false,
          deviceSN: snValidation.data.sn
        };
      }

      const sensorsResponse = await sensorsService.getSensors();
      if (!sensorsResponse.success || !sensorsResponse.sensor) {
        return { success: false, error: 'Failed to fetch sensor details' };
      }

      const lcliteSensors = sensorsResponse.sensor.filter(
        (sensor: Sensor) => sensor.sn === snValidation.data?.sn
      );

      if (!lcliteSensors.length) {
        return { success: false, error: 'Sensor not found' };
      }

      const primarySensor = lcliteSensors[0];

    const validatedSensors: ValidatedSensor[] = [];
    
    for (const sensor of lcliteSensors) {
        if (sensor.sn_addonsensor) {
          const addonInfo = await sensorsService.getSNInfo(sensor.sn_addonsensor);
          
          if (addonInfo.success && addonInfo.info?.[0]) {
            const sensorType = SENSOR_PRODUCT_TYPES[addonInfo.info[0].ProductTpye];
            
            if (sensorType) {
              validatedSensors.push({
                sn: sensor.sn_addonsensor,
                type: sensorType,
                plantName: sensor.plant_name,
                inPlantId: sensor.in_plant_id,
                substrate: sensor.plant_soiltype
              });
            }
          }
        }
      }

      return {
        success: true,
        isExisting: true,
        deviceInfo: {
          sn: snValidation.data.sn,
          location: {
            location_id: primarySensor.location_id,
            location_name: primarySensor.in_location,
            id: Number(primarySensor.location_id)
          },
          connectedSensors: validatedSensors
        }
      };

    } catch (error) {
        console.error('Validation error:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Validation failed' 
        };
      }
    };

    export const setupDeviceState = (validationResult: ValidationResult) => {
        if (!validationResult.success) return false;
      
        if (!validationResult.isExisting) {
          useDeviceStore.setState({ deviceSN: validationResult.deviceSN });
          return false;
        }
      
        if (!validationResult.deviceInfo) return false;
      
        const { deviceInfo } = validationResult;
      
        useDeviceStore.setState({
          deviceSN: deviceInfo.sn,
          selectedLocation: deviceInfo.location,
          sensors: deviceInfo.connectedSensors.map(sensor => ({
            sn: sensor.sn,
            type: sensor.type,
            plantName: sensor.plantName || undefined,
            plantId: sensor.inPlantId || undefined,
            substrate: sensor.substrate || undefined,
            image: SENSOR_IMAGES[sensor.type],
            measurements: [],
            hasSubstrate: Boolean(sensor.substrate)
          }))
        });
      
        return true;
      };