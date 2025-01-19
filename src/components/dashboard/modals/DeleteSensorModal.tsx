// src/components/dashboard/modals/DeleteSensorModal.tsx
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { sensorsService } from 'lib/services/sensor.service';

interface DeleteSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sn: string;
  onDeleted: () => void;
}

const DeleteSensorModal: React.FC<DeleteSensorModalProps> = ({ 
  isOpen, 
  onClose, 
  sn,
  onDeleted 
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await sensorsService.deleteSensor(sn);

      if (response.success) {
        onDeleted();
        onClose();
      } else {
        setError(response.message || 'Failed to delete sensor');
      }
    } catch (err) {
        setError(`An error occurred while delelting the sensor: ${err}`);
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
      <DialogTitle className="text-white">Confirm Delete Sensor</DialogTitle>
      <DialogContent>
        <p className="text-zinc-300">
          Are you sure you want to delete sensor <span className="font-mono">{sn}</span>? 
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
          {loading ? 'Deleting...' : 'Delete Sensor'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSensorModal;