// src/app/mobile/plant/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { useDeviceStore } from 'lib/store/deviceStore';
import { plantService } from 'lib/services/plant.service';
import type { Plant } from 'lib/types/plants';
import CreatePlantModal from '@components/dashboard/modals/CreatePlantModal';
import { sensorsService } from 'lib/services/sensor.service';

export default function PlantSelectPage() {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedLocation = useDeviceStore((state) => state.selectedLocation);
  const sensors = useDeviceStore((state) => state.sensors);
  const selectedPlant = useDeviceStore((state) => state.selectedPlant);
  const latestSensor = sensors[sensors.length - 1];
  const setSelectedPlant = useDeviceStore((state) => state.setSelectedPlant);
  const updateLatestSensor = useDeviceStore((state) => state.updateLatestSensor);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deviceSN = useDeviceStore(state => state.deviceSN);



  const fetchPlants = async () => {
    setIsLoading(true);
    try {
      const response = await plantService.getPlants();
      if (response.success) {
        const locationPlants = response.plants?.filter(
          (          plant: { location_id: string; }) => plant.location_id === selectedLocation?.location_id
        ) || [];
        
        setPlants(locationPlants);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch plants');
        setPlants([]);
      }
    } catch (err) {
      console.error('error while loading plants: ', err);
      setError('Failed to load plants');
      setPlants([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedLocation?.location_id) {
      fetchPlants();
    }
  }, [selectedLocation?.location_id]);

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant);
    setSelectionError(null);
  };

  const handleContinue = async () => {
    if (isSubmitting) return; 

    if (!selectedPlant) {
      setSelectionError('Please select a plant to continue');
      return;
    }
  
    const latestSensor = sensors[sensors.length - 1];

    setIsSubmitting(true);
    try {
      const response = await sensorsService.addSensorToPlant({
        sn: deviceSN || '',
        plant_id: Number(selectedPlant.plant_id),
        addonsn: latestSensor?.sn || ''
      });
  
      if (!response.success) {
        setSelectionError(response.message || 'Failed to connect sensor to plant');
        return;
      }
  
      updateLatestSensor({
        ...latestSensor,
        plantName: selectedPlant.plant_name,
        plantId: selectedPlant.plant_id
      });
      
      router.push(`/mobile/device-details/${selectedLocation?.location_id}`);
    } catch (error) {
      console.error('Error adding sensor to plant:', error);
      setSelectionError('Failed to connect sensor to plant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-auto bg-gradient flex flex-col p-4">
      <h1 className="text-white text-xl font-light mt-12 px-3 text-center w-full">
        For which plant in{" "}
        <span className="text-green-600">{selectedLocation?.location_name}</span>
        {" "}would you like to install the{" "}
        {latestSensor?.type}?
      </h1>

      <div className="flex-1 flex flex-col mt-12">
        <div className="border border-white/10 bg-[rgba(24,24,27,0.5)] rounded-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)] min-h-[400px] w-10/12 mx-auto h-full p-4">
          <button
            onClick={() => setShowPlantModal(true)}
            className="border-b border-zinc-700/50 w-full flex items-center justify-between font-sans font-semibold gap-2 px-6 py-3 mb-5 text-sm rounded-lg hover:bg-zinc-800/50 transition-colors text-slate-500"
          >
            <span>Add New Plant</span>
            <AddIcon className="w-4 h-4" />
          </button>

          <div className="flex justify-center">
            {isLoading ? (
              <div className="text-zinc-400 text-center py-4">
                Loading plants...
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-4">{error}</div>
            ) : (
              <div className="space-y-2">
                {plants.map((plant) => (
                  <button
                    key={plant.plant_id}
                    className={`w-full flex items-center text-center gap-3 px-16 py-3 rounded-xl hover:bg-zinc-800/50 transition-colors ${
                      selectedPlant?.plant_id === plant.plant_id
                        ? "bg-zinc-800/50 text-white"
                        : "text-gray-400"
                    }`}
                    onClick={() => handlePlantSelect(plant)}
                  >
                    <LocalFloristIcon className="w-5 h-5" />
                    <span className="text-sm font-bold">
                      {plant.plant_name}
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

      <div className="w-full flex justify-between items-center pb-12 pt-8">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center rounded-full text-black bg-white border border-zinc-700"
        >
          <ArrowBackIcon sx={{ fontSize: 18, fontWeight: 300 }} />
        </button>

        <button
          onClick={handleContinue}
          disabled={isSubmitting || !selectedPlant}
          className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center ${selectedPlant
              ? isSubmitting
                ? "bg-gray-300 text-gray-600"
                : "bg-white text-black"
              : "bg-gray-300 text-gray-600"
            }`}
        >
          {isSubmitting ? 'Processing...' : 'Continue'} &nbsp;
          <ArrowForwardIcon sx={{ fontSize: 18, fontWeight: 300 }} />
        </button>
      </div>
      <CreatePlantModal
        isOpen={showPlantModal}
        onClose={() => setShowPlantModal(false)}
        onPlantCreated={async () => {
          if (selectedLocation?.location_id) {
            await fetchPlants();
            setShowPlantModal(false);
          }
        }}
        locationId={selectedLocation?.location_id || ''}
      />
    </div>
  );
}