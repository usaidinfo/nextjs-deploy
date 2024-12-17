// src/lib/store/deviceStore.ts
import { create } from 'zustand';
import { Location } from 'lib/types/location';
import { Plant } from 'lib/types/plants';
import { SensorType } from 'lib/constants/sensor-types';

interface ScannedSensor {
  sn: string;
  type: SensorType;
  measurements: string[];
  hasSubstrate: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any
}

interface Sensor extends ScannedSensor {
  image: string;
  plantName?: string;
  substrate?: string;
}

interface DeviceState {
  selectedLocation: Location | null;
  deviceSN: string | null;
  sensors: Sensor[];
  selectedPlant: Plant | null;
  scannedSensor: ScannedSensor | null;
  setLocation: (location: Location) => void;
  setDeviceSN: (sn: string) => void;
  addSensor: (sensor: Sensor) => void;
  setSelectedPlant: (plant: Plant) => void;
  setScannedSensor: (sensor: ScannedSensor) => void;
  updateLatestSensor: (updatedSensor: Sensor) => void;
  reset: () => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  selectedLocation: null,
  deviceSN: null,
  sensors: [],
  selectedPlant: null,
  scannedSensor: null,
  setLocation: (location) => set({ selectedLocation: location }),
  setDeviceSN: (sn) => set({ deviceSN: sn }),
  addSensor: (sensor) => set((state) => ({ 
    sensors: [...state.sensors, sensor] 
  })),
  setSelectedPlant: (plant) => set({ selectedPlant: plant }),
  setScannedSensor: (sensor) => set({ scannedSensor: sensor }),
  updateLatestSensor: (updatedSensor) => set((state) => ({
    sensors: state.sensors.map((sensor, index) => 
      index === state.sensors.length - 1 ? updatedSensor : sensor
    )
  })),
  reset: () => set({ 
    selectedLocation: null, 
    deviceSN: null, 
    sensors: [], 
    selectedPlant: null,
    scannedSensor: null
  })
}));