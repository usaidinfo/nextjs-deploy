// src/app/mobile/select-sensor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDeviceStore } from "lib/store/deviceStore";
import { SENSOR_IMAGES, SENSOR_MEASUREMENTS, SENSOR_FEATURES, SensorType } from "lib/constants/sensor-types";
import { sensorsService } from "lib/services/sensor.service";

const SUBSTRATE_OPTIONS = ['Organic Wool', 'Coco', 'Rock Wool'];

export default function SelectSensorPage() {
  const router = useRouter();
  const [selectedSubstrate, setSelectedSubstrate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const deviceSN = useDeviceStore(state => state.deviceSN);
  const addSensor = useDeviceStore((state) => state.addSensor);
  const scannedSensor = useDeviceStore((state) => state.scannedSensor);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!scannedSensor) {
      router.replace('/mobile/device-details');
    }
  }, [scannedSensor, router]);

  const handleContinue = async () => {
    if (isLoading || isRedirecting) return;

    if (!scannedSensor) {
      setError('No sensor data available');
      return;
    }

    if (!deviceSN) {
      setError('Device information not found');
      return;
    }
  
    if (scannedSensor.hasSubstrate && !selectedSubstrate) {
      setError('Please select a substrate type');
      return;
    }
  
    setIsLoading(true);
    setIsRedirecting(true);
    try {
      const response = await sensorsService.addAddonSensor({
        sn: deviceSN,
        addonsensorsn: scannedSensor.sn
      });
  
      if (!response.success) {
        setError(response.message || 'Failed to connect sensor');
        return;
      }
  
      setError(null);
      addSensor({
        ...scannedSensor,
        image: SENSOR_IMAGES[scannedSensor.type as SensorType],
        substrate: selectedSubstrate,
      });
  
      router.push(`/mobile/plant`);
    } catch (error) {
      console.log('error connecting sensor :', error)
      setError('Failed to connect sensor. Please try again.');
      setIsRedirecting(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!scannedSensor) {
    return null;
  }

  const sensorType = scannedSensor.type as SensorType;
  const measurements = SENSOR_MEASUREMENTS[sensorType] || [];
  const features = SENSOR_FEATURES[sensorType] || {};

  return (
    <div className="min-h-[100dvh] bg-gradient flex flex-col p-4">
      <div className="flex-1 flex flex-col">
        <h1 className="text-white text-2xl text-center font-light mt-12 mb-8">
          {scannedSensor.type}
        </h1>

        <div className="flex-1 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 flex items-center justify-center">
            <img
              src={SENSOR_IMAGES[sensorType]}
              alt={sensorType}
              className="h-[250px] w-auto object-contain"
            />
          </div>

          <div className="md:w-1/2 space-y-6">
            <div className="bg-[rgba(24,24,27,0.5)] rounded-xl p-4">
              <h2 className="text-white font-semibold mb-3">Key Features</h2>
              <div className="space-y-2">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-400">{key}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(24,24,27,0.5)] rounded-xl p-4">
              <h2 className="text-white font-semibold mb-3">Measurements</h2>
              <div className="space-y-2">
                {measurements.map((measurement, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-300">{measurement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {scannedSensor.hasSubstrate && (
          <div className="flex flex-col items-center justify-center my-8">
            <p className="text-white text-center mb-2">
              Select substrate type for optimal measurements
            </p>

            <select
              value={selectedSubstrate}
              onChange={(e) => {
                setSelectedSubstrate(e.target.value);
                setError(null);
              }}
              className="px-4 py-2 bg-green-200 rounded-lg text-black cursor-pointer outline-none"
            >
              <option value="" disabled>
                Select Substrate
              </option>
              {SUBSTRATE_OPTIONS.map((substrate) => (
                <option key={substrate} value={substrate}>
                  {substrate}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center mb-4">
            {error}
          </div>
        )}
      </div>

      <div className="w-full flex justify-between items-center pb-8">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center text-black justify-center rounded-full bg-white"
        >
          <ArrowBackIcon sx={{ fontSize: 18, fontWeight: 300 }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={isLoading || isRedirecting}
          className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center ${(!scannedSensor.hasSubstrate || selectedSubstrate)
              ? isLoading
                ? "bg-gray-300 text-gray-600"
                : "bg-white text-black"
              : "bg-gray-300 text-gray-600"
            }`}
        >
          {isLoading ? 'Connecting...' : 'Continue'} &nbsp;
          <ArrowForwardIcon sx={{ fontSize: 18, fontWeight: 300 }} />
        </button>
      </div>
    </div>
  );
}