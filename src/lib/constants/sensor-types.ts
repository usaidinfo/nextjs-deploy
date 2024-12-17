// src/lib/constants/sensor-types.ts

export type SensorType = 
  | 'VWC Soil Moisture Sensor'
  | 'Precise Soil Moisture Sensor'
  | 'Leaf Wetness Sensor';

export const SENSOR_PRODUCT_TYPES: Record<string, SensorType> = {
  '16': 'VWC Soil Moisture Sensor',
  '8': 'Precise Soil Moisture Sensor',
  '15': 'Leaf Wetness Sensor'
};

export const SENSOR_MEASUREMENTS: Record<SensorType, string[]> = {
  'VWC Soil Moisture Sensor': [
    'Volumetric Water Content (VWC) measurement in organic soil',
    'Soil moisture percentage range: 0-100%',
    'High accuracy in organic growing media'
  ],
  'Precise Soil Moisture Sensor': [
    'VWC in organic soil, coco and rock wool (%)',
    'EC (Electrical Conductivity) monitoring (ms/cm)',
    'Soil Temperature sensing'
  ],
  'Leaf Wetness Sensor': [
    'Real-time leaf surface moisture detection',
    'Leaf Wetness (%)',
    'Leaf Temperature (°C)',
  ]
};

export const SENSOR_FEATURES: Record<SensorType, Record<string, string>> = {
  'VWC Soil Moisture Sensor': {
    'Accuracy': '±3% VWC',
    'Range': '0-100% VWC',
    'Resolution': '0.1%',
    'Update Rate': '1 minute'
  },
  'Precise Soil Moisture Sensor': {
    'VWC Accuracy': '±2% VWC',
    'EC Range': '0-5 mS/cm',
    'Temperature Range': '0-50°C',
    'Update Rate': '30 seconds'
  },
  'Leaf Wetness Sensor': {
    'Wetness Resolution': '0.1%',
    'Temperature Accuracy': '±0.5°C',
    'Response Time': '< 5 seconds',
    'Coverage Area': '5cm²'
  }
};

export const SENSOR_SUBSTRATE_REQUIRED: Record<SensorType, boolean> = {
  'VWC Soil Moisture Sensor': true,
  'Precise Soil Moisture Sensor': true,
  'Leaf Wetness Sensor': false
};

export const SENSOR_IMAGES: Record<SensorType, string> = {
  'VWC Soil Moisture Sensor': '/vwc-soil-moisture.png',
  'Precise Soil Moisture Sensor': '/precise-soil-moisture.png',
  'Leaf Wetness Sensor': '/leaf-wetness.png'
};

export const VALID_SENSORS = Object.values(SENSOR_PRODUCT_TYPES);