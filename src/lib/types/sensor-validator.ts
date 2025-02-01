// src/lib/types/sensor-validation.ts
import { Location } from './location';
import { SensorType } from '../constants/sensor-types';

export interface ValidatedSensor {
  sn: string;
  type: SensorType;
  plantName: string | null;
  inPlantId: string | null;
  substrate: string | null;
}

export interface ValidationResult {
  success: boolean;
  isExisting?: boolean;
  error?: string;
  deviceInfo?: {
    sn: string;
    location: Location;
    connectedSensors: ValidatedSensor[];
  };
}

export interface SNInfo {
  SN: string;
  ProductTpye: string;
  Info: string;
  sensor_existing: boolean;
}