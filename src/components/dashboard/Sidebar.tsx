'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { locationService } from 'lib/services/location.service';
import { plantService } from 'lib/services/plant.service';
import { sensorsService } from 'lib/services/sensor.service';
import type { Location } from 'lib/types/location';
import type { Plant } from 'lib/types/plants';
import type { Sensor } from 'lib/types/sensor';
import { useRouter } from 'next/navigation';
import CreateLocationModal from './modals/CreateLocationModal';
import CreatePlantModal from './modals/CreatePlantModal';
import { LocationSkeleton } from './skeletons/LocationSkeleton';
import { PlantSkeleton } from './skeletons/PlantSkeleton';
import Image from 'next/image';
import { useDeviceStore } from 'lib/store/deviceStore';

interface LocationData {
  plants: Plant[];
  sensors: Sensor[];
  isLoading: boolean;
  error: string | null;
}

interface LocationPlants {
  [key: string]: LocationData;
}

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationPlants, setLocationPlants] = useState<LocationPlants>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreatePlantModal, setShowCreatePlantModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const setActivePlant = useDeviceStore(state => state.setActivePlant)
  const setActiveLocation = useDeviceStore(state => state.setActiveLocation)

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await locationService.getLocations();

      if (response.success && response.locations) {
        setLocations(response.locations);
      } else {
        setError(response.message || 'Failed to fetch locations');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocationData = async (locationId: string) => {
    try {
      setLocationPlants(prev => ({
        ...prev,
        [locationId]: { plants: [], sensors: [], isLoading: true, error: null }
      }));
  
      const [plantsResponse, sensorsResponse] = await Promise.all([
        plantService.getPlants(),
        sensorsService.getSensors()
      ]);
  
      const locationSensors = sensorsResponse.success ? 
        sensorsResponse.sensor.filter((sensor: { location_id: string; }) => sensor.location_id === locationId) : 
        [];
  
      if (plantsResponse.success && plantsResponse.plants) {
        const locationPlants = plantsResponse.plants.filter(
          (          plant: { location_id: string; }) => plant.location_id === locationId
        );
  
        setLocationPlants(prev => ({
          ...prev,
          [locationId]: {
            plants: locationPlants,
            sensors: locationSensors,
            isLoading: false,
            error: null
          }
        }));
      } else {
        setLocationPlants(prev => ({
          ...prev,
          [locationId]: {
            plants: [],
            sensors: locationSensors,
            isLoading: false,
            error: plantsResponse.message || 'Failed to fetch plants'
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching location data: ", error);
      setLocationPlants(prev => ({
        ...prev,
        [locationId]: {
          plants: [],
          sensors: [],
          isLoading: false,
          error: 'Failed to load location data'
        }
      }));
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const toggleLocation = async (locationId: string) => {
    const isExpanding = expandedLocation !== locationId;
    setExpandedLocation(isExpanding ? locationId : null);

    if (isExpanding && !locationPlants[locationId]) {
      await fetchLocationData(locationId);
    }
  };

  const handleLocationCreated = () => {
    fetchLocations();
  };

  const handleLocationClick = (locationId: string) => {
    const location = locations.find(loc => loc.location_id === locationId);
    if (location) {
      setActiveLocation(locationId, location.location_name);
    }
    router.push(`/dashboard/${locationId}`);
    toggleLocation(locationId);
  };

  const handlePlantClick = (plant: Plant, locationId: string) => {
    setActivePlant(plant.plant_id, plant.plant_name);
    const locationData = locationPlants[locationId];
    if (!locationData) return;

    const plantSensor = locationData.sensors.find(
      sensor => sensor.in_plant_id === plant.plant_id
    );

    window.dispatchEvent(new CustomEvent('plantSelected', {
      detail: {
        plantId: plant.plant_id,
        plantName: plant.plant_name,
        sensorInfo: plantSensor ? {
          sn: plantSensor.sn,
          addonSensor: plantSensor.sn_addonsensor
        } : null
      }
    }));
  };

  const handleAddLocation = () => {
    setShowCreateModal(true);
  };

  const handleAddPlant = async (locationId: string) => {
    setSelectedLocationId(locationId);
    setShowCreatePlantModal(true);
  };

  useEffect(() => {
    const handleLocationDeleted = () => {
      fetchLocations();
    };
  
    window.addEventListener('locationDeleted', handleLocationDeleted);
    return () => {
      window.removeEventListener('locationDeleted', handleLocationDeleted);
    };
  }, []);

  return (
    <div className="w-auto text-gray-300 h-auto my-8 mr-4 flex">
      <div className="w-6 bg-gradient1" />
      <div className="flex-1 p-4 border border-white/10 bg-[rgba(24,24,27,0.5)] rounded-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-center border-b border-zinc-700/50 gap-2 mb-8">
          <Image
            src="/leafai-logo3.png"
            alt="Leaf AI"
            width={96}
            height={72}
            priority
            className="object-contain"
          />
        </div>

        <button
          onClick={handleAddLocation}
          className="w-full flex items-center justify-between font-sans font-semibold gap-2 px-4 py-3 mt-4 text-sm rounded-lg hover:bg-zinc-800/50 transition-colors text-slate-500"
        >
          <span>New Grow Location</span>
          <AddIcon className="w-4 h-4" />
        </button>

        <nav className="mt-3 space-y-2">
          {isLoading && (
            <LocationSkeleton />
          )}

          {error && (
            <div className="text-center py-4 mx-auto w-10/12 text-red-400">
              {error}
            </div>
          )}

          {!isLoading && !error && locations.length === 0 && (
            <div className="text-center py-4 text-slate-400">
              No locations found. Create your first location!
            </div>
          )}

          {!isLoading && !error && locations.map((location) => (
            <div key={location.location_id} className="space-y-1">
              <button
                onClick={() => handleLocationClick(location.location_id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                  ${pathname === `/dashboard/${location.location_id}`
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-zinc-800/50 text-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <HomeIcon className="w-4 h-4" />
                  <span className="text-sm">{location.location_name}</span>
                </div>
                {expandedLocation === location.location_id ? (
                  <ExpandLessIcon className="w-5 h-5" />
                ) : (
                  <ExpandMoreIcon className="w-5 h-5" />
                )}
              </button>

              {expandedLocation === location.location_id && (
                <div className="ml-6 space-y-1">
                  {locationPlants[location.location_id]?.isLoading ? (
                    <PlantSkeleton />
                  ) : locationPlants[location.location_id]?.error ? (
                    <div className="text-sm text-red-400 px-0 py-2">
                      {locationPlants[location.location_id].error}
                    </div>
                  ) : (
                    <>
                      {locationPlants[location.location_id]?.plants.map((plant: Plant) => {
                        const hasAddonSensor = locationPlants[location.location_id].sensors.some(
                          sensor => sensor.in_plant_id === plant.plant_id && sensor.sn_addonsensor
                        );
                        
                        return (
                          <button
                            key={plant.plant_id}
                            onClick={() => handlePlantClick(plant, location.location_id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-zinc-800/50 
                              transition-colors text-sm ${hasAddonSensor ? 'text-green-400' : 'text-gray-300'}`}
                          >
                            <div className="flex items-center gap-2">
                              <LocalFloristIcon className="w-4 h-4" />
                              <span>{plant.plant_name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}

                  <button
                    onClick={() => handleAddPlant(location.location_id)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-zinc-800/50 transition-colors text-sm text-slate-500"
                  >
                    <AddIcon className="w-4 h-4" />
                    Add Flower
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <CreateLocationModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLocationCreated={handleLocationCreated}
      />
      {selectedLocationId && (
        <CreatePlantModal 
          isOpen={showCreatePlantModal}
          onClose={() => {
            setShowCreatePlantModal(false);
            setSelectedLocationId(null);
          }}
          onPlantCreated={() => {
            if (selectedLocationId) {
              fetchLocationData(selectedLocationId);
            }
          }}
          locationId={selectedLocationId || ''}
        />
      )}
    </div>
  );
};

export default Sidebar;