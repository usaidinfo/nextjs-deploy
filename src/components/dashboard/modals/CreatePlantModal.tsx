// src/components/dashboard/CreatePlantModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { plantService } from 'lib/services/plant.service';

interface CreatePlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantCreated: () => void;
  locationId: string;
}

const SOIL_TYPES = [
  { value: 'soil', label: 'Real Soil' },
  { value: 'stone', label: 'Stone Fibre' },
  { value: 'coconut', label: 'Coconut Fibre' }
];

const CreatePlantModal: React.FC<CreatePlantModalProps> = ({
  isOpen,
  onClose,
  onPlantCreated,
  locationId
}) => {
  const [plantName, setPlantName] = useState('');
  const [soilType, setSoilType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await plantService.createPlant(
        Number(locationId), 
        plantName.trim(),
        soilType
      );

      if (response.success) {
        onPlantCreated();
        onClose();
        setPlantName('');
        setSoilType('');
      } else {
        setError(response.message || 'Failed to create plant');
      }
    } catch (err) {
      console.error("error while creating the plant: ", err)
      setError('An error occurred while creating the plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: 'rgba(24,24,27,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          width: '90vw',
          maxWidth: '400px'
        },
        className: 'md:!min-w-[400px]'
      }}
    >
      <DialogTitle className="flex justify-between items-center text-white">
        Add New Plant
        <IconButton 
          onClick={onClose}
          className="text-zinc-400 hover:text-white"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-500">
            <ErrorOutlineIcon fontSize="small" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label 
                htmlFor="plantName" 
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Plant Name
              </label>
              <input
                id="plantName"
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className="w-full px-4 py-2 md:py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg 
                          text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500
                          transition-colors text-base md:text-sm"
                placeholder="Enter plant name"
                required
              />
            </div>

            <div>
              <label 
                htmlFor="soilType" 
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Soil Type
              </label>
              <select
                id="soilType"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-4 py-2 md:py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg 
                          text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500
                          transition-colors text-base md:text-sm"
                required
              >
                <option value="">Select soil type</option>
                {SOIL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 md:py-2 text-base md:text-sm text-zinc-300 hover:text-white 
                       bg-zinc-800/50 hover:bg-zinc-700/50 
                       border border-zinc-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !plantName.trim() || !soilType}
              className="px-4 py-3 md:py-2 text-base md:text-sm text-white 
                       bg-blue-600 hover:bg-blue-700 
                       disabled:bg-blue-600/50 disabled:cursor-not-allowed
                       rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Add Plant'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlantModal;