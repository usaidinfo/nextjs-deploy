export interface MainReadingData {
    time: string;
    temp: number;
    humidity: number;
    vpd: number;
    co2: number;
  }
  
export interface PlantReadingData {
    time: string;
    soilTemp: number;
    bulkEC: number;
    vwcRock: number;
    vwc: number;
    vwcCoco: number;
    poreEC: number;
  }