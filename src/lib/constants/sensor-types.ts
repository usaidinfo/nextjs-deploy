// src/lib/constants/sensor-types.ts

export type SensorType = 'Precise Soil Moisture Sensor' | 'VWC Soil Moisture Sensor' | 'Leaf Wetness Sensor';

interface SensorInfo {
    type: SensorType;
    measurements: string[];
    hasSubstrate: boolean;
  }

export const VALID_SENSORS: SensorInfo[] = [
    {
      type: "Precise Soil Moisture Sensor",
      measurements: [
        "VWC in organic soil, coco and rock wool (%)",
        "EC (ms/cm)",
        "Soil Temperature (°C)",
      ],
      hasSubstrate: true,
    },
    {
      type: "VWC Soil Moisture Sensor",
      measurements: ["VWC in organic soil (%)"],
      hasSubstrate: true,
    },
    {
      type: "Leaf Wetness Sensor",
      measurements: ["Leaf wetness (%)", "Leaf Temperature (°C)"],
      hasSubstrate: false,
    }
  ];
  
  export const SENSOR_IMAGES: Record<SensorType, string> = {
    'Precise Soil Moisture Sensor': '/precise-soil-moisture.png',
    'VWC Soil Moisture Sensor': '/vwc-soil-moisture.png',
    'Leaf Wetness Sensor': '/leaf-wetness.png'
  };