import { ChartData } from "@components/dashboard/widgets/EnvironmentChart";
import { PlantChartData } from "@components/dashboard/widgets/PlantSensorChart";

export interface SensorData {
  LeafWetness?: string;
  LeafTemp?: string;
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
  VWC_CHANNEL_0?: number;
  VWC_CHANNEL_1?: number;
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
  plant_soiltype: string | null;
  sn_addonsensor: string | null;
  sn_addonsensor_info?: {
    SENSOR_VALUE_FIELD: string;
  };
  firstSensorValueAt: string;
  lastSensorValueAt: string;
}

export interface PlantSensorWithData {
  sensor: Sensor;
  sensorData: SensorData | null;
  chartData: PlantChartData;
  historicalData: SensorValue[];
  plantSoilType?: string;
}

export interface MainSensorWithData {
  sensor: Sensor;
  sensorData: SensorData | null;
  chartData: ChartData;
  historicalData: SensorValue[];
}
