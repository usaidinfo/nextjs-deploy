import { CreateLocationRequest, LocationResponse } from 'lib/types/location';

class LocationService {
  private baseUrl = '/api/location';

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

      const response = await fetch(`${this.baseUrl}/get-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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

      const response = await fetch(`${this.baseUrl}/create-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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

      const response = await fetch(`${this.baseUrl}/delete-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({ location_id: locationId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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