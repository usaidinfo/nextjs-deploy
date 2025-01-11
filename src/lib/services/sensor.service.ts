import { format } from "date-fns";
import { SENSOR_MEASUREMENTS, SENSOR_PRODUCT_TYPES, SENSOR_SUBSTRATE_REQUIRED } from "lib/constants/sensor-types";

export default interface DeviceInfo {
  sn: string;
  type: string;
  model: string;
}

class SensorsService {
  private baseUrl = '/api/sensor';

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

      const response = await fetch(`${this.baseUrl}/get-sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        }
      });

      if (response.status === 401) {
        this.handleTokenError();
        return { success: false, message: 'Invalid token' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error === 'Invalid token') {
        this.handleTokenError();
        return { success: false, message: 'Invalid token' };
      }

      return data;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch sensors',
        data: []
      };
    }
  }

  async getSensorValues(sn: string, startDate?: Date, endDate?: Date, locationId?: string) {

    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }
      const response = await fetch(`${this.baseUrl}/get-sensor-values`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({ 
          sn,
          start: formattedStartDate,
          end: formattedEndDate,
          location_id: locationId
        })
      });
      return await response.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch sensor values',
        data: []
      };
    }
  }

  async addSensorToPlant(data: { sn: string; plant_id: number }) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sensor/add-sensor-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token || '',
        },
        body: JSON.stringify(data)
      });
  
      return await response.json();
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
      const response = await fetch(`${this.baseUrl}/create-sensor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token || '',
        },
        body: JSON.stringify(data)
      });
  
      return await response.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create sensor',
      };
    }
  }
  
  async addAddonSensor(data: { sn: string; addonsensorsn: string }) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/add-addon-sensor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token || '',
        },
        body: JSON.stringify(data)
      });
  
      return await response.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to add on sensor',
      };
    }
  }

  async validateQRData(qrData: string) {
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
            info: JSON.parse(snValidation.info[0].Info)
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

  async getSNInfo(sn: string) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sensor/get-sensor-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token || '',
        },
        body: JSON.stringify({ sn })
      });
      return await response.json();
    } catch (error) {
      console.error('error fetching SN Info: ', error)
      return { success: false, message: 'Failed to validate device' };
    }
  }
}

export const sensorsService = new SensorsService();