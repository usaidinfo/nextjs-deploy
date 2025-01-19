// src/components/dashboard/CreateLocationModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { locationService } from 'lib/services/location.service';
import { StyledTextField } from '@components/common/form/StyledTextField';

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationCreated: () => void;
}

const CreateLocationModal: React.FC<CreateLocationModalProps> = ({
  isOpen,
  onClose,
  onLocationCreated
}) => {
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await locationService.createLocation({
        location_name: locationName.trim()
      });

      if (response.success) {
        onLocationCreated();
        onClose();
        setLocationName('');
      } else {
        setError(response.message || 'Failed to create location');
      }
    } catch (err) {
      console.error('error while creating locations: ', err)
      setError('An error occurred while creating the location: ');
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
          backgroundColor: 'rgba(24,24,27,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          width: '90vw',
          maxWidth: '400px'
        },
        className: 'md:!min-w-[400px]'
      }}
    >
      <DialogTitle className="flex justify-between items-center text-white">
        Create New Location
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
          <div className="my-6">
            <StyledTextField
              fullWidth
              label="Location Name"
              variant="outlined"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter location name"
              error={!!error}
              disabled={loading}
            />
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
              disabled={loading || !locationName.trim()}
              className="px-4 py-3 md:py-2 text-base md:text-sm text-white 
                       bg-blue-600 hover:bg-blue-700 
                       disabled:bg-blue-600/50 disabled:cursor-not-allowed
                       rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create Location'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLocationModal;