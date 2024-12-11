// src/lib/store/deviceStore.ts
import { create } from 'zustand';
import { Location } from 'lib/types/location';
import { Plant } from 'lib/types/plants';

interface Sensor {
  type: string;
  measurements: string[];
  hasSubstrate: boolean;
  image: string;
  plantName?: string;
  substrate?: string;
}

interface DeviceState {
  selectedLocation: Location | null;
  deviceSN: string | null;
  sensors: Sensor[];
  selectedPlant: Plant | null;
  setLocation: (location: Location) => void;
  setDeviceSN: (sn: string) => void;
  addSensor: (sensor: Sensor) => void;
  setSelectedPlant: (plant: Plant) => void;
  reset: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateLatestSensor: (updatedSensor: any) => void
  scannedSensor: {
    type: string;
    measurements: string[];
    hasSubstrate: boolean;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setScannedSensor: (sensor: any) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  selectedLocation: null,
  deviceSN: null,
  sensors: [],
  selectedPlant: null,
  setLocation: (location) => set({ selectedLocation: location }),
  setDeviceSN: (sn) => set({ deviceSN: sn }),
  addSensor: (sensor) => set((state) => ({ 
    sensors: [...state.sensors, sensor] 
  })),
  setSelectedPlant: (plant) => set({ selectedPlant: plant }),
  reset: () => set({ 
    selectedLocation: null, 
    deviceSN: null, 
    sensors: [], 
    selectedPlant: null 
  }),
  updateLatestSensor: (updatedSensor) => set((state) => ({
    sensors: state.sensors.map((sensor, index) => 
      index === state.sensors.length - 1 ? updatedSensor : sensor
    )
  })),
  scannedSensor: null,
  setScannedSensor: (sensor) => set({ scannedSensor: sensor })
}));