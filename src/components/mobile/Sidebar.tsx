// src/components/mobile/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { locationService } from 'lib/services/location.service';
import { plantService } from 'lib/services/plant.service';
import { useAuth } from 'lib/hooks/useAuth';
import type { Location } from 'lib/types/location';
import { Plant } from 'lib/types/plants';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
}

interface LocationPlantsState {
  [key: string]: {
    plants: Plant[];
    error: string | null;
  };
}

export default function MobileSidebar({ onClose }: Props) {
  const router = useRouter();
  const { handleLogout } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
  const [locationPlants, setLocationPlants] = useState<LocationPlantsState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [activePlantId, setActivePlantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const response = await locationService.getLocations();
        if (response.success && response.locations) {
          setLocations(response.locations);
        } else {
          setError('Failed to fetch locations');
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const fetchPlants = async (locationId: string) => {
    try {
      const response = await plantService.getPlants();
      if (response.success && response.plants) {
        const locationPlants = response.plants.filter(
          (          plant: { location_id: string; }) => plant.location_id === locationId
        );

        setLocationPlants(prev => ({
          ...prev,
          [locationId]: {
            plants: locationPlants,
            error: null
          }
        }));
      } else {
        setLocationPlants(prev => ({
          ...prev,
          [locationId]: {
            plants: [],
            error: response.message || 'Failed to fetch plants'
          }
        }));
      }
    } catch (err) {
      console.error('error fetching plants: ', err);
      setLocationPlants(prev => ({
        ...prev,
        [locationId]: {
          plants: [],
          error: 'Failed to load plants'
        }
      }));
    }
  };

  const toggleLocation = async (locationId: string) => {
    if (expandedLocation === locationId) {
      setExpandedLocation(null);
    } else {
      setExpandedLocation(locationId);
      if (!locationPlants[locationId]) {
        await fetchPlants(locationId);
      }
    }
  };

  const handleLocationClick = (locationId: string) => {
    toggleLocation(locationId);
    setActiveLocationId(locationId);
    router.push(`/mobile/dashboard/${locationId}`);
  };

  const handlePlantClick = (plant: Plant) => {
    setActivePlantId(plant.plant_id);
    window.dispatchEvent(new CustomEvent('plantSelected', {
      detail: {
        plantId: plant.plant_id,
        plantName: plant.plant_name,
        locationId: plant.location_id,
        locationName: plant.location_name
      }
    }));
  };

  return (
    <div className="h-full flex flex-col py-6">
          <div className="px-4 border-b border-zinc-700/50 mb-4">
        <Image
          src="/leafai-logo3.png"
          alt="Leaf AI"
          width={96} 
          height={72}
          priority
          className="object-contain"
        />
          </div>
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <div className="text-zinc-400 text-center">Loading locations...</div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : (
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location.location_id}>
                <button
                  onClick={() => handleLocationClick(location.location_id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors text-white
                    ${activeLocationId === location.location_id ? 'bg-zinc-800/80 border border-zinc-700' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <HomeIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">{location.location_name}</span>
                  </div>
                  {expandedLocation === location.location_id ? (
                    <ExpandLessIcon className="w-5 h-5" />
                  ) : (
                    <ExpandMoreIcon className="w-5 h-5" />
                  )}
                </button>

                    {expandedLocation === location.location_id && (
                        <div className="ml-6 mt-2 space-y-1">
                            {!locationPlants[location.location_id] ? (
                                <div className="text-zinc-400 text-sm px-2 py-1">Loading plants...</div>
                            ) : locationPlants[location.location_id].error ? (
                                <div className="text-red-400 text-sm px-2 py-1">{locationPlants[location.location_id].error}</div>
                            ) : locationPlants[location.location_id].plants?.map((plant: Plant) => (
                                <button
                                    key={plant.plant_id}
                                    onClick={() => handlePlantClick(plant)}
                                    className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors 
                                      ${activePlantId === plant.plant_id ? 'bg-zinc-800/80 border border-zinc-700 text-white' : 'text-gray-300'}`}
                                >
                                    <LocalFloristIcon className="w-4 h-4" />
                                    <span className="text-sm">{plant.plant_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-4 border-t border-zinc-700/50 pt-4">
        <button
          onClick={() => {
            handleLogout();
            onClose();
          }}
          className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors text-red-400"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}