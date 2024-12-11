export interface Plant {
    plant_id: string;
    plant_name: string;
  }
  
  export interface PlantResponse {
    success: boolean;
    plants: Plant[];
  }