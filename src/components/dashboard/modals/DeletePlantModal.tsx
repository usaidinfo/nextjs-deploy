// src/components/dashboard/modals/DeletePlantModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { plantService } from 'lib/services/plant.service';
import { useDeviceStore } from 'lib/store/deviceStore';

interface DeletePlantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeletePlantModal: React.FC<DeletePlantModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const activePlantId = useDeviceStore(state => state.activePlantId);
  const activePlantName = useDeviceStore(state => state.activePlantName);
  const resetActiveItems = useDeviceStore(state => state.resetActiveItems);

  const handleConfirmDelete = async () => {
    if (!activePlantId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await plantService.deletePlant(activePlantId);

      if (response.success) {
        resetActiveItems();
        window.dispatchEvent(new Event('locationDeleted'));
        onClose();
      } else {
        setError(response.message || 'Failed to delete plant');
      }
    } catch (err) {
      console.error('Error while deleting plant: ', err);
      setError('An error occurred while deleting the plant');
    } finally {
      setLoading(false);
    }
  };

  if (!activePlantId || !activePlantName) return null;

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
      <DialogTitle className="text-white">Confirm Delete Plant</DialogTitle>
      <DialogContent>
        <p className="text-zinc-300">
          Are you sure you want to delete plant <span className="font-semibold">{activePlantName}</span>? 
          This action cannot be undone.
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
          {loading ? 'Deleting...' : 'Delete Plant'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePlantModal;