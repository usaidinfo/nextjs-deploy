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

export interface Sensor2 {
  sensor_id?: string;
  sn?: string;
  location_id?: string;
  in_location?: string;
  in_plant_id?: string | null;
  plant_name?: string | null;
  plant_soiltype?: string | null;
  sn_addonsensor?: string | null;
  sn_addonsensor_info?: {
    SENSOR_VALUE_FIELD: string;
  };
  firstSensorValueAt?: string;
  lastSensorValueAt?: string;
  type?: string;
  plantName?: string;
  substrate?: string;
  image?: string;
  measurements?: string[];
  hasSubstrate?: boolean;
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

export interface SNInfo {
  SN: string;
  ProductTpye: string;
  Info: string;
  sensor_existing?: boolean;
}

export interface SNInfoResponse {
  success: boolean;
  message?: string;
  info?: SNInfo[];
  sensor_existing: boolean;
}

export interface QRValidationResponse {
  isValid: boolean;
  error?: string;
  data?: {
    sn: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: any;
    sensor_existing?: boolean;
  };
}

export interface ProcessedSensorData {
  deviceSN: string;
  location: {
    locationId: string;
    locationName: string;
  };
  connectedSensors: ConnectedSensor[];
}

export interface ValidationResult {
  success: boolean;
  error?: string;
  isExisting?: boolean;
  data?: ProcessedSensorData | {
    sn: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: any;
  };
}

export interface DeviceSensor {
  sn: string;
  type: string;
  plantName?: string;
  plantId?: string;
  substrate?: string;
  image: string;
}

export interface ConnectedSensor {
  substrate: string;
  in_plant_id: string | null;
  plant_name: string | null;
  sn: string;
  type: string;
  plantName?: string | null;
  plantId?: string;
}