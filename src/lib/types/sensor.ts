export interface SensorData {
  LCSN: string;
  LCFW: string;
  AirHum: number;
  AirTemp: number;
  AirCO2: number;
  AirVPD: number;
  SensorType: number;
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
}

export interface SensorResponse {
  success: boolean;
  sensor: Sensor[];
}