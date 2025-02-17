// src/components/dashboard/modals/DeleteAccountModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useRouter } from 'next/navigation';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/account/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': localStorage.getItem('token') || '',
        },
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError(`An error occurred while deleting the account : ${err}`);
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
      <DialogTitle className="text-white">Delete Account</DialogTitle>
      <DialogContent>
        <p className="text-zinc-300">
          Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
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
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountModal;