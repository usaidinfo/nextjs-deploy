class PlantService {
    private baseUrl = '/api/plants';
  
    async getPlants() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return { success: false, message: 'No authentication token found' };
        }
  
        const response = await fetch(`${this.baseUrl}/get-plants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': token,
          },
          body: JSON.stringify({})
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch plants');
        }
  
        return data;
      } catch (error) {
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to fetch plants',
          plants: []
        };
      }
    }
  
    
  
    async createPlant(locationId: number, plantName: string, soilType: string) {
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
            plant_name: plantName,
            soiltype: soilType
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