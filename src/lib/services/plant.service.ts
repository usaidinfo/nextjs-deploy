class PlantService {
    private baseUrl = '/api/plants';
  
    async getPlants(locationId: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return { success: false, message: 'No authentication token found' };
        }
  
        const today = new Date().toISOString().split('T')[0];
  
        const response = await fetch(`${this.baseUrl}/get-plants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': token,
          },
          body: JSON.stringify({
            location_id: locationId,
            start: today, 
            end: today 
          })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to fetch plants' 
        };
      }
    }
  
    
  
    async createPlant(locationId: number, plantName: string) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return { success: false, message: 'No authentication token found' };
        }
  
        const response = await fetch(`${this.baseUrl}/create-plant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': token,
          },
          body: JSON.stringify({
            location_id: locationId,
            plant_name: plantName
          })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to create plant' 
        };
      }
    }
  }
  
  export const plantService = new PlantService();