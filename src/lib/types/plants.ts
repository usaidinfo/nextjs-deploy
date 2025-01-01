export interface Plant {
  plant_id: string;
  plant_name: string;
  location_id: string;
  location_name: string;
}

export interface PlantResponse {
  success: boolean;
  message?: string;
  plants?: Plant[];
}