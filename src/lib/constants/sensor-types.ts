// src/lib/constants/sensor-types.ts

export type SensorType = 
  | 'VWC Soil Moisture Sensor'
  | 'Precise Soil Moisture Sensor'
  | 'Leaf Wetness Sensor'

export const SENSOR_PRODUCT_TYPES: Record<string, SensorType> = {
  '16': 'VWC Soil Moisture Sensor',
  '8': 'Precise Soil Moisture Sensor',
  '15': 'Leaf Wetness Sensor',
  '17' : 'VWC Soil Moisture Sensor'
};

export const SENSOR_MEASUREMENTS: Record<SensorType, string[]> = {
  'VWC Soil Moisture Sensor': [
    'Measure the water content (VWC %)',
    'Use in organic soil',
    'Continuously optimize irrigation strategy',
    'Prevent overwatering and underwatering'
  ],
  'Precise Soil Moisture Sensor': [
    'Measure the water content (VWC %), Fertilizer (EC mS/cm) and Soil Temperature (°C)',
    'Works with organic soil, rockwool, or coconut fibers',
    'Accurately capture moisture levels, nutrient content, and soil temperature',
    'Help save water and optimize fertilization strategy'
  ],
  'Leaf Wetness Sensor': [
    'Measure the leaf wetness (% RH) and the leaf temperature',
    'Early detect stress conditions in plants',
    'Optimize photosynthesis for faster growth',
    'Promote health and vitality'
  ]
};

export const SENSOR_FEATURES: Record<SensorType, Record<string, string>> = {
  'VWC Soil Moisture Sensor': {
    'Range': '0-100% VWC',
    'Accuracy (0-50%)': '±2%',
    'Accuracy (50-100%)': '±3%',
    'Long-term Stability': '≤1% per year',
    'Size': '45 x 15 x 123 mm',
    'Protection Level': 'IP68',
    'Cable Length': '2 meter',
    'Connector': 'M12 plug with female thread'
  },
  'Precise Soil Moisture Sensor': {
    'VWC Range (Organic)': '0-60%',
    'VWC Resolution (Organic)': '0.10%',
    'VWC Accuracy (Organic)': '±3%',
    'VWC Range (Coco/Rock)': '0-96%',
    'VWC Resolution (Coco/Rock)': '0.10%',
    'VWC Accuracy (Coco/Rock)': '±3%',
    'EC Range': '0-5 dS/m',
    'EC Resolution': '0.001 dS/m',
    'EC Accuracy': '±3%',
    'Temperature Range': '-20 to 60°C',
    'Temperature Resolution': '0.0625°C',
    'Temperature Accuracy': '±1.0°C',
    'Size': '132.5 x 27 x 16.2 mm',
    'Cable Length': '3 meter',
    'Connector': 'M12 plug with female thread'
  },
  'Leaf Wetness Sensor': {
    'Wetness Range': '0-100% RH',
    'Temperature Range': '-40°C to +60°C',
    'Wetness Accuracy': '±5% RH @25°C',
    'Temperature Accuracy': '±0.5°C @25°C',
    'Wetness Resolution': '0.1% RH',
    'Temperature Resolution': '0.1°C',
    'Protection Level': 'IP67',
    'Cable Length': '2 meters',
    'Size': '45 x 15 x 123 mm',
    'Connector': 'M12 plug with female thread (ideal for Leaf-Connect Lite)',
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