export default interface DeviceInfo {
  sn: string;
  type: string;
  model: string;
}

class SensorsService {
  private baseUrl = '/api/sensor';

  async getSensors() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = await fetch(`${this.baseUrl}/get-sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch sensors',
        data: []
      };
    }
  }

  async getSensorValues(sn: string, startDate?: Date, endDate?: Date) {
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
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch sensor values',
        data: []
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
      const parsedData = JSON.parse(qrData);
      
      if (!parsedData.sn || !parsedData.type || !parsedData.model) {
        return { isValid: false, error: 'Invalid QR code format' };
      }

      const snValidation = await this.getSNInfo(parsedData.sn);
      
      if (snValidation.success) {
        return { 
          isValid: true, 
          data: parsedData 
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