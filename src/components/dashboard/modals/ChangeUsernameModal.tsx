
// src/components/dashboard/modals/ChangeUsernameModal.tsx
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { accountService } from 'lib/services/account.service';
import { StyledTextField } from '@components/common/form/StyledTextField';

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeUsernameModal: React.FC<ChangeUsernameModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await accountService.changeUsername(username);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setUsername('');
        }, 1500);
      } else {
        setError(response.message || 'Failed to change username');
      }
    } catch (err) {
        setError(`An error occurred while changing username: ${err}`);
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
          minWidth: '400px',
          backdropFilter: 'blur(10px)',
        }
      }}
    >
      <DialogTitle className="text-white">Change Username</DialogTitle>
      <DialogContent>
              <p className="text-zinc-400 text-sm mb-6">Enter your new username below</p>
              <div className="space-y-4">
                  <StyledTextField
                      fullWidth
                      type="text"
                      label="New Username"
                      variant="outlined"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter new username"
                      error={!!error}
                      helperText={error}
                      disabled={loading}
                  />
              </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm text-center">
              Username changed successfully!
            </p>
          </div>
        )}
      </DialogContent>
      <DialogActions className="p-6 pt-2">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm text-zinc-300 hover:text-white 
                   bg-zinc-800/50 hover:bg-zinc-700/50 
                   border border-zinc-700 rounded-lg mr-2
                   transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 text-sm text-white 
                   bg-blue-600 hover:bg-blue-500 
                   disabled:bg-blue-600/50 disabled:cursor-not-allowed
                   rounded-lg transition duration-200"
        >
          {loading ? 'Changing...' : 'Change Username'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeUsernameModal;