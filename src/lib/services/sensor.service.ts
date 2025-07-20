import { subHours } from "date-fns";
import { SENSOR_MEASUREMENTS, SENSOR_PRODUCT_TYPES, SENSOR_SUBSTRATE_REQUIRED } from "lib/constants/sensor-types";
import { QRValidationResponse, SNInfoResponse, Sensor, SensorValue } from "lib/types/sensor";

export default interface DeviceInfo {
  sn: string;
  type: string;
  model: string;
}

class SensorsService {
  private baseUrl = '/api/sensor';

  // Static data for sensors
  private staticSensors: Sensor[] = [
    {
      sensor_id: '1',
      sn: 'LC001234',
      location_id: '1',
      in_location: 'Greenhouse 1',
      in_plant_id: '1',
      plant_name: 'Tomato Cherry',
      plant_soiltype: 'soil',
      sn_addonsensor: 'AS001234',
      sn_addonsensor_info: JSON.stringify({ SENSOR_VALUE_FIELD: 'VWC_CHANNEL_0' }),
      firstSensorValueAt: '2024-01-01T00:00:00Z',
      lastSensorValueAt: new Date().toISOString()
    },
    {
      sensor_id: '2',
      sn: 'LC001235',
      location_id: '2',
      in_location: 'Indoor Garden',
      in_plant_id: '3',
      plant_name: 'Lettuce Romaine',
      plant_soiltype: 'coconut',
      sn_addonsensor: 'AS001235',
      sn_addonsensor_info: JSON.stringify({ SENSOR_VALUE_FIELD: 'VWC_CHANNEL_1' }),
      firstSensorValueAt: '2024-01-01T00:00:00Z',
      lastSensorValueAt: new Date().toISOString()
    },
    {
      sensor_id: '3',
      sn: 'LC001236',
      location_id: '3',
      in_location: 'Hydroponic Setup',
      in_plant_id: '4',
      plant_name: 'Cucumber English',
      plant_soiltype: 'stone',
      sn_addonsensor: 'AS001236',
      sn_addonsensor_info: JSON.stringify({ SENSOR_VALUE_FIELD: 'VWC_CHANNEL_0' }),
      firstSensorValueAt: '2024-01-01T00:00:00Z',
      lastSensorValueAt: new Date().toISOString()
    },
    {
      sensor_id: '4',
      sn: 'LC001237',
      location_id: '4',
      in_location: 'Outdoor Garden',
      in_plant_id: '6',
      plant_name: 'Mint Fresh',
      plant_soiltype: 'soil',
      sn_addonsensor: 'AS001237',
      sn_addonsensor_info: JSON.stringify({ SENSOR_VALUE_FIELD: 'VWC_CHANNEL_1' }),
      firstSensorValueAt: '2024-01-01T00:00:00Z',
      lastSensorValueAt: new Date().toISOString()
    }
  ];

  // Static SNInfo data
  private staticSNInfo = {
    'LC001234': { SN: 'LC001234', ProductTpye: 'lclite', Info: '{"model":"Leaf-Connect Lite"}', sensor_existing: true },
    'LC001235': { SN: 'LC001235', ProductTpye: 'lclite', Info: '{"model":"Leaf-Connect Lite"}', sensor_existing: true },
    'LC001236': { SN: 'LC001236', ProductTpye: 'lclite', Info: '{"model":"Leaf-Connect Lite"}', sensor_existing: true },
    'LC001237': { SN: 'LC001237', ProductTpye: 'lclite', Info: '{"model":"Leaf-Connect Lite"}', sensor_existing: true },
    'AS001234': { SN: 'AS001234', ProductTpye: '8', Info: '{"model":"Precise Soil Moisture Sensor"}', sensor_existing: true },
    'AS001235': { SN: 'AS001235', ProductTpye: '8', Info: '{"model":"Precise Soil Moisture Sensor"}', sensor_existing: true },
    'AS001236': { SN: 'AS001236', ProductTpye: '8', Info: '{"model":"Precise Soil Moisture Sensor"}', sensor_existing: true },
    'AS001237': { SN: 'AS001237', ProductTpye: '15', Info: '{"model":"Leaf Wetness Sensor"}', sensor_existing: true },
  };

  private generateSensorData(baseTime: Date, sensorSN: string) {
    const sensor = this.staticSensors.find(s => s.sn === sensorSN);
    const soilType = sensor?.plant_soiltype || 'soil';
    
    return {
      LCSN: sensorSN,
      LCFW: "1.0.0",
      AirHum: 45 + Math.random() * 20,
      AirTemp: 22 + Math.random() * 8,
AirCO2: Math.round(400 + Math.random() * 200),
      AirVPD: 0.8 + Math.random() * 0.6,
      SensorType: 8,
      SoilTemp: (20 + Math.random() * 10).toString(),
      BulkEC: soilType !== 'soil' ? (1.2 + Math.random() * 0.8).toString() : undefined,
      VWCRock: soilType === 'stone' ? (60 + Math.random() * 30).toString() : undefined,
      VWC: soilType === 'soil' ? (40 + Math.random() * 25).toString() : undefined,
      VWCCoco: soilType === 'coconut' ? (55 + Math.random() * 25).toString() : undefined,
      PoreEC: (0.8 + Math.random() * 0.6).toString(),
      LeafWetness: (20 + Math.random() * 40).toString(),
      LeafTemp: (21 + Math.random() * 6).toString(),
      VWC_CHANNEL_0: Math.random() > 0.5 ? 45 + Math.random() * 20 : null,
      VWC_CHANNEL_1: Math.random() > 0.5 ? 50 + Math.random() * 20 : null,
    };
  }

  private generateSensorValues(sensorSN: string, startDate: Date, endDate: Date): SensorValue[] {
    const values: SensorValue[] = [];
    const diffHours = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const intervals = Math.min(Math.floor(diffHours), 200); // Limit to 200 data points
    
    for (let i = 0; i < intervals; i++) {
      const time = new Date(startDate.getTime() + (i * (diffHours / intervals) * 60 * 60 * 1000));
      const sensorData = this.generateSensorData(time, sensorSN);
      
      values.push({
        SENSORDATAJSON: JSON.stringify(sensorData),
        CreateDateTime: time.toISOString()
      });
    }
    
    return values.reverse(); // Latest first
  }

  private handleTokenError() {
    localStorage.removeItem('token');
    alert("Time to water your session! Please sign in again to resume monitoring your garden.🍃")
    window.location.href = '/login';
  }

  async getSensors() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.handleTokenError();
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        sensor: this.staticSensors
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch sensors',
        sensor: []
      };
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSensorValues(sn: string, startDate?: Date, endDate?: Date, locationId?: string) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Use default date range if not provided
      const end = endDate || new Date();
      const start = startDate || subHours(end, 4);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const sensorValues = this.generateSensorValues(sn, start, end);

      return {
        success: true,
        sensorvalue: sensorValues
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch sensor values',
        sensorvalue: []
      };
    }
  }

  async addSensorToPlant(data: { sn: string; plant_id: number; addonsn: string }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find and update the sensor
      const sensorIndex = this.staticSensors.findIndex(s => s.sn === data.sn);
      if (sensorIndex !== -1) {
        this.staticSensors[sensorIndex].in_plant_id = data.plant_id.toString();
        this.staticSensors[sensorIndex].sn_addonsensor = data.addonsn;
      }

      return { success: true, message: 'Sensor added to plant successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to add sensor to plant' 
      };
    }
  }

  async createSensor(data: { location_id: number; sn: string }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if sensor already exists
      const existingSensor = this.staticSensors.find(s => s.sn === data.sn);
      if (existingSensor) {
        return { success: false, message: 'Sensor already exists' };
      }

      return { success: true, message: 'Sensor created successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create sensor',
      };
    }
  }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addAddonSensor(data: { sn: string; addonsensorsn: string }) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true, message: 'Addon sensor added successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to add addon sensor',
      };
    }
  }

  async validateQRData(qrData: string): Promise<QRValidationResponse> {
    try {
      const url = new URL(qrData);
      if (!url.hostname.includes('leafai')) {
        return { isValid: false, error: 'Invalid device QR code' };
      }
  
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const sn = pathSegments[pathSegments.length - 1];
      if (!sn) {
        return { isValid: false, error: 'Invalid serial number' };
      }
  
      const snValidation = await this.getSNInfo(sn);
      
      if (snValidation.success && snValidation.info?.[0]) {
        if (snValidation.info[0].ProductTpye !== 'lclite') {
          return { isValid: false, error: 'Invalid device type. Please scan a Leaf-Connect Lite device.' };
        }
  
        return { 
          isValid: true, 
          data: {
            sn: snValidation.info[0].SN,
            type: snValidation.info[0].ProductTpye,
            info: JSON.parse(snValidation.info[0].Info),
            sensor_existing: snValidation.info[0].sensor_existing
          }
        };
      }
  
      return { isValid: false, error: 'Invalid device' };
    } catch (error) {
      return { 
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to validate QR data' 
      };
    }
  }

  async validateAddSensorQRData(qrData: string) {
    try {
      const url = new URL(qrData);
      if (!url.hostname.includes('leafai')) {
        return { isValid: false, error: 'Invalid sensor QR code' };
      }
  
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const sn = pathSegments[pathSegments.length - 1];
      if (!sn) {
        return { isValid: false, error: 'Invalid serial number' };
      }
  
      const snValidation = await this.getSNInfo(sn);
      
      if (snValidation.success && snValidation.info?.[0]) {
        const productType = snValidation.info[0].ProductTpye;
        const sensorType = SENSOR_PRODUCT_TYPES[productType];
  
        if (!sensorType) {
          return { isValid: false, error: 'Unsupported sensor type' };
        }
  
        return { 
          isValid: true, 
          data: {
            sn: snValidation.info[0].SN,
            type: sensorType,
            measurements: SENSOR_MEASUREMENTS[sensorType],
            hasSubstrate: SENSOR_SUBSTRATE_REQUIRED[sensorType]
          }
        };
      }
  
      return { isValid: false, error: 'Invalid sensor' };
    } catch (error) {
      return { 
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to validate sensor' 
      };
    }
  }

  async getSNInfo(sn: string): Promise<SNInfoResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found', sensor_existing: false };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const snInfo = this.staticSNInfo[sn as keyof typeof this.staticSNInfo];
      
      if (snInfo) {
        return {
          success: true,
          info: [snInfo],
          sensor_existing: snInfo.sensor_existing
        };
      }

      return { success: false, message: 'Serial number not found', sensor_existing: false };
    } catch (error) {
      console.error('error fetching SN Info: ', error)
      return { success: false, message: 'Failed to validate device', sensor_existing: false };
    }
  }

  async deleteSensor(sn: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove sensor from static data
      const sensorIndex = this.staticSensors.findIndex(s => s.sn === sn);
      if (sensorIndex !== -1) {
        this.staticSensors.splice(sensorIndex, 1);
      }

      return { success: true, message: 'Sensor deleted successfully' };
    } catch (error) {
      console.error('Delete sensor error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete sensor' 
      };
    }
  }
}

export const sensorsService = new SensorsService();