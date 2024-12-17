// src/app/mobile/location/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { locationService } from "lib/services/location.service";
import { sensorsService } from "lib/services/sensor.service";
import type { Location } from "lib/types/location";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useDeviceStore } from "lib/store/deviceStore";
import CreateLocationModal from "@components/dashboard/modals/CreateLocationModal";

export default function LocationPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedLocation = useDeviceStore((state) => state.selectedLocation);
  const deviceSN = useDeviceStore((state) => state.deviceSN);
  const setLocation = useDeviceStore((state) => state.setLocation);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isCreatingSensor, setIsCreatingSensor] = useState(false);

  const fetchLocations = async () => {
    try {
      const response = await locationService.getLocations();
      if (response.success && response.locations) {
        setLocations(response.locations);
      } else {
        setError(response.message || "Failed to fetch locations");
      }
    } catch (err) {
      console.error('error while loading locations: ', err)
      setError("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleLocationSelect = (location: Location) => {
    setLocation(location);
    setSelectionError(null);
  };

  const handleContinue = async () => {
    if (!selectedLocation) {
      setSelectionError('Please select a location to continue');
      return;
    }

    if (!deviceSN) {
      setSelectionError('No device serial number found');
      return;
    }

    setIsCreatingSensor(true);
    setSelectionError(null);

    try {
      const createResponse = await sensorsService.createSensor({
        location_id: selectedLocation.location_id,
        sn: deviceSN
      });

      if (createResponse.success) {
        router.push(`/mobile/device-details/${selectedLocation.location_id}`);
      } else {
        setSelectionError(createResponse.message || 'Failed to register device');
      }
    } catch (err) {
      console.error('Error creating sensor:', err);
      setSelectionError('Failed to register device');
    } finally {
      setIsCreatingSensor(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-auto bg-gradient flex flex-col p-4">
      <h1 className="text-white text-2xl font-light mt-12 text-center w-full">
        Where is your <br />
        <span className="text-green-600">Leaf-Connect Lite</span> Located?
      </h1>

      <div className="flex-1 flex flex-col mt-12">
        <div className="border border-white/10 bg-[rgba(24,24,27,0.5)] rounded-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)] min-h-[400px] w-10/12 mx-auto h-full p-4">
          <button
            onClick={() => setShowLocationModal(true)}
            className="border-b border-zinc-700/50 w-full flex items-center justify-between font-sans font-semibold gap-2 px-6 py-3 mb-5 text-sm rounded-lg hover:bg-zinc-800/50 transition-colors text-slate-500"
          >
            <span>Add New Grow Location</span>
            <AddIcon className="w-4 h-4" />
          </button>

          <div className="flex justify-center">
            {isLoading ? (
              <div className="text-zinc-400 text-center py-4">
                Loading locations...
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-4">{error}</div>
            ) : (
              <div className="space-y-2">
                {locations.map((location) => (
                  <button
                    key={location.location_id}
                    className={`w-full flex items-center text-center gap-3 px-12 py-3 rounded-xl hover:bg-zinc-800/50 transition-colors ${
                      selectedLocation?.location_id === location.location_id
                        ? "bg-zinc-800/50 text-white"
                        : "text-gray-400"
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span className="text-sm font-bold">
                      {location.location_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {selectionError && (
          <div className="text-red-500 text-sm text-center mt-4">
            {selectionError}
          </div>
        )}
      </div>

      <div className="w-full flex justify-between items-center pb-12 pt-4">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center rounded-full text-black bg-white border border-zinc-700"
        >
          <ArrowBackIcon sx={{ fontSize: 18, fontWeight: 300 }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={isCreatingSensor}
          className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center ${
            selectedLocation && !isCreatingSensor
              ? "bg-white text-black"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {isCreatingSensor ? "Registering..." : "Continue"} &nbsp;
          <ArrowForwardIcon sx={{ fontSize: 18, fontWeight: 300 }} />
        </button>
      </div>
      
      <CreateLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationCreated={() => {
          fetchLocations();
          setShowLocationModal(false);
        }}
      />
    </div>
  );
}