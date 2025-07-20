import { CreateLocationRequest, LocationResponse, Location } from 'lib/types/location';

class LocationService {
  private baseUrl = '/api/location';

  // Static locations data
  private staticLocations: Location[] = [
    {
      location_id: '1',
      id: 1,
      location_name: 'Greenhouse 1'
    },
    {
      location_id: '2',
      id: 2,
      location_name: 'Indoor Garden'
    },
    {
      location_id: '3',
      id: 3,
      location_name: 'Hydroponic Setup'
    },
    {
      location_id: '4',
      id: 4,
      location_name: 'Outdoor Garden'
    }
  ];

  // Counter for generating new location IDs
  private locationIdCounter = 5;

  async getLocations(): Promise<LocationResponse> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: false
        };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        success: true,
        data: true,
        locations: [...this.staticLocations]
      };
    } catch (error) {
      console.error('Get locations error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch locations',
        data: false 
      };
    }
  }

  async createLocation(data: CreateLocationRequest): Promise<LocationResponse> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: false 
        };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if location name already exists
      const existingLocation = this.staticLocations.find(
        loc => loc.location_name.toLowerCase() === data.location_name.toLowerCase()
      );

      if (existingLocation) {
        return {
          success: false,
          message: 'Location name already exists',
          data: false
        };
      }

      // Create new location
      const newLocation: Location = {
        location_id: this.locationIdCounter.toString(),
        id: this.locationIdCounter,
        location_name: data.location_name
      };

      this.staticLocations.push(newLocation);
      this.locationIdCounter++;

      return {
        success: true,
        message: 'Location created successfully',
        data: true,
        locations: [...this.staticLocations]
      };
    } catch (error) {
      console.error('Create location error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create location',
        data: false 
      };
    }
  }

  async deleteLocation(locationId: number): Promise<LocationResponse> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
          data: false
        };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find and remove location
      const locationIndex = this.staticLocations.findIndex(
        loc => loc.id === locationId || loc.location_id === locationId.toString()
      );

      if (locationIndex === -1) {
        return {
          success: false,
          message: 'Location not found',
          data: false
        };
      }

      this.staticLocations.splice(locationIndex, 1);

      return {
        success: true,
        message: 'Location deleted successfully',
        data: true,
        locations: [...this.staticLocations]
      };
    } catch (error) {
      console.error('Delete location error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete location',
        data: false
      };
    }
  }
}

export const locationService = new LocationService();