// src/components/dashboard/modals/DeleteLocationModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { locationService } from 'lib/services/location.service';
import { useRouter } from 'next/navigation';
import { useDeviceStore } from 'lib/store/deviceStore';

interface DeleteLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
}

const DeleteLocationModal: React.FC<DeleteLocationModalProps> = ({ 
  isOpen, 
  onClose, 
  locationId 
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeLocationName = useDeviceStore(state => state.activeLocationName);

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await locationService.deleteLocation(Number(locationId));

      if (response.success) {
        window.dispatchEvent(new Event('locationDeleted'));
        onClose();
        router.push('/dashboard');
      } else {
        setError(response.message || 'Failed to delete location');
      }
    } catch (err) {
      console.error('Error while deleting location: ', err);
      setError('An error occurred while deleting the location');
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
        }
      }}
    >
      <DialogTitle className="text-white">Confirm Delete Location</DialogTitle>
      <DialogContent>
        <p className="text-zinc-300">
          Are you sure you want to delete this location: {activeLocationName}? This action cannot be undone.
        </p>
        {error && (
          <p className="mt-2 text-red-500 text-sm">{error}</p>
        )}
      </DialogContent>
      <DialogActions className="p-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-zinc-300 hover:text-white 
                   bg-zinc-800/50 hover:bg-zinc-700/50 
                   border border-zinc-700 rounded-lg mr-2"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelete}
          disabled={loading}
          className="px-4 py-2 text-sm text-white 
                   bg-red-600 hover:bg-red-700 
                   disabled:bg-red-600/50 disabled:cursor-not-allowed
                   rounded-lg"
        >
          {loading ? 'Deleting...' : 'Delete Location'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLocationModal;