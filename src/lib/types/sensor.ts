export interface SensorData {
  LCSN: string;
  LCFW: string;
  AirHum: number;
  AirTemp: number;
  AirCO2: number;
  AirVPD: number;
  SensorType: number;
  SoilTemp?: string;
  BulkEC?: string;
  VWCRock?: string;
  VWC?: string;
  VWCCoco?: string;
  PoreEC?: string;
}

export interface SensorValue {
  SENSORDATAJSON: string;
  CreateDateTime: string;
}

export interface SensorValueResponse {
  success: boolean;
  sensorvalue: SensorValue[];
}

export interface Sensor {
  sensor_id: string;
  sn: string;
  location_id: string;
  in_location: string;
  in_plant_id: string | null;
  plant_name: string | null;
  sn_addonsensor: string | null;
}