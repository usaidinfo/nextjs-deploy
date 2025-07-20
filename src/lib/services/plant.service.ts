import { Plant } from 'lib/types/plants';

class PlantService {
  private baseUrl = '/api/plants';

  // Static plants data
  private staticPlants: Plant[] = [
    {
      plant_id: '1',
      plant_name: 'Tomato Cherry',
      location_id: '1',
      location_name: 'Greenhouse 1'
    },
    {
      plant_id: '2',
      plant_name: 'Basil Sweet',
      location_id: '1',
      location_name: 'Greenhouse 1'
    },
    {
      plant_id: '3',
      plant_name: 'Lettuce Romaine',
      location_id: '2',
      location_name: 'Indoor Garden'
    },
    {
      plant_id: '4',
      plant_name: 'Cucumber English',
      location_id: '3',
      location_name: 'Hydroponic Setup'
    },
    {
      plant_id: '5',
      plant_name: 'Pepper Bell',
      location_id: '3',
      location_name: 'Hydroponic Setup'
    },
    {
      plant_id: '6',
      plant_name: 'Mint Fresh',
      location_id: '4',
      location_name: 'Outdoor Garden'
    }
  ];

  // Counter for generating new plant IDs
  private plantIdCounter = 7;

  // Static location names mapping
  private locationNames: Record<string, string> = {
    '1': 'Greenhouse 1',
    '2': 'Indoor Garden',
    '3': 'Hydroponic Setup',
    '4': 'Outdoor Garden'
  };

  async getPlants() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        success: true,
        plants: [...this.staticPlants]
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch plants',
        plants: []
      };
    }
  }

  async deletePlant(plantId: string | number) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find and remove plant
      const plantIndex = this.staticPlants.findIndex(
        plant => plant.plant_id === plantId.toString()
      );

      if (plantIndex === -1) {
        return {
          success: false,
          message: 'Plant not found'
        };
      }

      this.staticPlants.splice(plantIndex, 1);

      return {
        success: true,
        message: 'Plant deleted successfully'
      };
    } catch (error) {
      console.error('Delete plant error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete plant' 
      };
    }
  }

  async createPlant(locationId: number, plantName: string, soilType: string) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if plant name already exists in this location
      const existingPlant = this.staticPlants.find(
        plant => plant.location_id === locationId.toString() && 
                 plant.plant_name.toLowerCase() === plantName.toLowerCase()
      );

      if (existingPlant) {
        return {
          success: false,
          message: 'Plant name already exists in this location'
        };
      }

      // Get location name
      const locationName = this.locationNames[locationId.toString()] || 'Unknown Location';

      // Create new plant
      const newPlant: Plant = {
        plant_id: this.plantIdCounter.toString(),
        plant_name: plantName,
        location_id: locationId.toString(),
        location_name: locationName
      };

      this.staticPlants.push(newPlant);
      this.plantIdCounter++;

      return {
        success: true,
        message: 'Plant created successfully',
        plant: newPlant
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create plant' 
      };
    }
  }

  // Helper method to update location names when locations change
  updateLocationName(locationId: string, locationName: string) {
    this.locationNames[locationId] = locationName;
    
    // Update existing plants with new location name
    this.staticPlants.forEach(plant => {
      if (plant.location_id === locationId) {
        plant.location_name = locationName;
      }
    });
  }

  // Helper method to remove plants when location is deleted
  removeLocationPlants(locationId: string) {
    this.staticPlants = this.staticPlants.filter(
      plant => plant.location_id !== locationId
    );
  }
}

export const plantService = new PlantService();