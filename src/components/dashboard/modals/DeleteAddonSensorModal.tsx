// src/components/dashboard/modals/DeleteAddonSensorModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useDeviceStore } from 'lib/store/deviceStore';

interface DeleteAddonSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sn: string;
  addonSensorSN: string;
}

const DeleteAddonSensorModal: React.FC<DeleteAddonSensorModalProps> = ({ 
  isOpen, 
  onClose,
  sn,
  addonSensorSN
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetActiveItems = useDeviceStore(state => state.resetActiveItems);

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sensor/delete-addon-sensor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({
          sn,
          addonsensorsn: addonSensorSN
        }),
      });

      const data = await response.json();

      if (data.success) {
        resetActiveItems();
        window.dispatchEvent(new Event('sensorDeleted'));
        onClose();
      } else {
        setError(data.message || 'Failed to delete addon sensor');
      }
    } catch (err) {
      setError(`An error occurred while deleting the addon sensor${err}`);
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
      <DialogTitle className="text-white">Delete Addon Sensor</DialogTitle>
      <DialogContent>
        <p className="text-zinc-300">
          Are you sure you want to delete this addon sensor? This action cannot be undone.
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
          {loading ? 'Deleting...' : 'Delete Addon Sensor'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAddonSensorModal;