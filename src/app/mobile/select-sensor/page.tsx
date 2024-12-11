// src/app/mobile/select-sensor/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDeviceStore } from "lib/store/deviceStore";
import { SENSOR_IMAGES, SensorType } from "lib/constants/sensor-types";


export default function SelectSensorPage() {
  const router = useRouter();
  const [selectedSubstrate, setSelectedSubstrate] = useState("");
  const addSensor = useDeviceStore((state) => state.addSensor);
  const scannedSensor = useDeviceStore(state => state.scannedSensor);


  const handleContinue = () => {
    if (scannedSensor?.hasSubstrate && !selectedSubstrate) return;

  
    if (scannedSensor) {
      addSensor({
        type: scannedSensor.type,
        measurements: scannedSensor.measurements,
        hasSubstrate: scannedSensor.hasSubstrate,
        image: SENSOR_IMAGES[scannedSensor.type as SensorType],
        substrate: selectedSubstrate,
      });
      router.push("/mobile/plant");
    }
  };

  if (!scannedSensor) {
      router.push('/mobile/device-details');
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient flex flex-col p-4">
      <div className="flex-1 flex flex-col">
        <h1 className="text-white text-2xl text-center font-light mt-12 mb-8">
           {scannedSensor.type}
        </h1>

        <div className="font-semibold pl-2">Measurements:</div>
        <div className="text-gray-400 text-sm mb-8">
        {scannedSensor.measurements.map((measurement, index) => (
         <div key={index} className="ml-2">
           • {measurement}
         </div>
       ))}
        </div>

        <div className="flex-1 flex items-center">
            <img
            src={SENSOR_IMAGES[scannedSensor.type as SensorType]}
            alt={scannedSensor.type}
            className="h-[300px] w-auto object-contain"
          />
        </div>

        {scannedSensor.hasSubstrate && (
          <div className="flex flex-col items-center justify-center mb-12">
            <p className="text-white text-center mb-2">
              This Soil Moisture Sensor is set in{" "}
            </p>

            <select
              value={selectedSubstrate}
              onChange={(e) => setSelectedSubstrate(e.target.value)}
              className="px-4 py-2 bg-green-200 rounded-lg text-black cursor-pointer outline-none"
            >
              <option value="" disabled>
                Select Substrate
              </option>
              {['Organic Wool', 'Coco', 'Rock Wool'].map((substrate, index) => (
                <option key={index} value={substrate}>
                  {substrate}
                </option>
              ))}
            </select>
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
          className="px-4 bg-white py-3 rounded-xl text-black text-sm font-medium flex items-center"
        >
          Continue &nbsp;
          <ArrowForwardIcon sx={{ fontSize: 18, fontWeight: 300 }} />
        </button>
      </div>
    </div>
  );
}
