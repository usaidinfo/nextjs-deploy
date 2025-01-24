// src/components/dashboard/CreatePlantModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { plantService } from 'lib/services/plant.service';
import { StyledTextField } from '@components/common/form/StyledTextField';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSelect = styled(Select)({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#008500',
  },
  '& .MuiSelect-select': {
    color: 'white',
    padding: '14px 20px',
  },
  backgroundColor: 'rgba(24, 24, 27, 0.4)',
  borderRadius: '12px',
  color: 'white',
});

interface CreatePlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantCreated: () => void;
  locationId: string;
}

const SOIL_TYPES = [
  { value: 'soil', label: 'Organic Soil' },
  { value: 'stone', label: 'Rock Wool' },
  { value: 'coconut', label: 'Coco\'s Substrat' }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSoilTypeChange = (event: SelectChangeEvent<any>) => {
    setSoilType(event.target.value);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: 'rgba(24,24,27,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          width: '90vw',
          maxWidth: '400px',
          backdropFilter: 'blur(10px)'
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
        <div className="space-y-6 mb-6">
            <p className="text-zinc-400 text-sm">Enter details for your new plant</p>
            
            <StyledTextField
              fullWidth
              label="Plant Name"
              variant="outlined"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Enter plant name"
              error={!!error}
              disabled={loading}
            />

            <FormControl fullWidth>
              <InputLabel 
                id="soil-type-label" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': { color: '#009600' }
                }}
              >
                Soil Type
              </InputLabel>
              <StyledSelect
                labelId="soil-type-label"
                value={soilType}
                label="Soil Type"
                onChange={handleSoilTypeChange}
                >
                <MenuItem value="">
                  <em>Select soil type</em>
                </MenuItem>
                {SOIL_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </StyledSelect>
            </FormControl>
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