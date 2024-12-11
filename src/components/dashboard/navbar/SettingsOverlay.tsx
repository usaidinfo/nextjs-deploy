// src/components/dashboard/SettingsOverlay.tsx
import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRouter, useParams } from 'next/navigation';
import { locationService } from 'lib/services/location.service';

interface SettingsOverlayProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ anchorEl, onClose }) => {
  const router = useRouter();
  const { locationId } = useParams();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  const handleDeleteClick = () => {
    onClose();
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await locationService.deleteLocation(Number(locationId));

      if (response.success) {
        setShowConfirmDialog(false);
        window.dispatchEvent(new Event('locationDeleted'));
        router.push('/dashboard');
      } else {
        setError(response.message || 'Failed to delete location');
      }
    } catch (err) {
      console.error('error while deleting location: ', err)
      setError('An error occurred while deleting the location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            backgroundColor: 'rgba(24,24,27,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            minWidth: '200px'
          }
        }}
      >
        <MenuItem 
          onClick={handleDeleteClick}
          className="text-white hover:bg-zinc-700 flex items-center gap-2"
        >
          <DeleteOutlineIcon fontSize="small" />
          <span>Delete Location</span>
        </MenuItem>
      </Menu>

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        PaperProps={{
          style: {
            backgroundColor: 'rgba(24,24,27,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle className="text-white">Confirm Delete</DialogTitle>
        <DialogContent>
          <p className="text-zinc-300">
            Are you sure you want to delete this location? This action cannot be undone.
          </p>
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <button
            onClick={() => setShowConfirmDialog(false)}
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
    </>
  );
};

export default SettingsOverlay;