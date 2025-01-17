// src/components/dashboard/SettingsOverlay.tsx
import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useParams } from 'next/navigation';
import { useDeviceStore } from 'lib/store/deviceStore';
import { getSettingsOptions } from 'lib/constants/settings-options';
import DeleteLocationModal from '../modals/DeleteLocationModal';
import DeleteSensorModal from '../modals/DeleteSensorModal';
import DeletePlantModal from '../modals/DeletePlantModal';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import ChangeEmailModal from '../modals/ChangeEmailModal';
import ChangeUsernameModal from '../modals/ChangeUsernameModal';

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'delete':
      return <DeleteOutlineIcon fontSize="small" color='inherit' />;
    case 'password':
      return <LockOutlinedIcon fontSize="small" color='inherit' />;
    case 'email':
      return <EmailOutlinedIcon fontSize="small" color='inherit' />;
    case 'username':
      return <PersonOutlineOutlinedIcon fontSize="small" color='inherit'/>;
    default:
      return null;
  }
};

interface SettingsOverlayProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ anchorEl, onClose }) => {
  const [selectedModal, setSelectedModal] = useState<'deleteSensor' | 'deleteLocation' | 'deletePlant' | 'changePassword' | 'changeEmail' | 'changeUsername' | null>(null);
  const activeSensor = useDeviceStore(state => state.activeSensor);
  const activePlantId = useDeviceStore(state => state.activePlantId);
  const resetActiveItems = useDeviceStore(state => state.resetActiveItems);
  const params  = useParams();
  const locationId = typeof params?.locationId === 'string' ? params.locationId : '';

  const options = getSettingsOptions(!!activeSensor, !!activePlantId, !!locationId);

  const handleOptionClick = (modalType: 'deleteSensor' | 'deleteLocation' | 'deletePlant' | 'changePassword' | 'changeEmail' | 'changeUsername') => {
    setSelectedModal(modalType);
    onClose();
  };

  const handleSensorDeleted = () => {
    resetActiveItems();
    window.dispatchEvent(new Event('sensorDeleted'));
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
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
        {options.map((option) => (
          <MenuItem 
            key={option.id}
            onClick={() => handleOptionClick(option.modalType)}
            className="text-white hover:bg-zinc-700 flex items-center gap-2"
          >
            {getIcon(option.iconType)}
          <span className='text-white'>{option.label}</span>
          </MenuItem>
        ))}
      </Menu>

      {selectedModal === 'deleteSensor' && activeSensor && (
        <DeleteSensorModal
          isOpen={true}
          onClose={() => setSelectedModal(null)}
          sn={activeSensor}
          onDeleted={handleSensorDeleted}
        />
      )}

      {selectedModal === 'deleteLocation' && (
        <DeleteLocationModal
          isOpen={true}
          onClose={() => setSelectedModal(null)}
          locationId={locationId}
        />
      )}

      {selectedModal === 'deletePlant' && (
        <DeletePlantModal
          isOpen={true}
          onClose={() => setSelectedModal(null)}
        />
      )}

      {selectedModal === 'changePassword' && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => setSelectedModal(null)}
        />
      )}

      {selectedModal === 'changeEmail' && (
        <ChangeEmailModal
          isOpen={true}
          onClose={() => setSelectedModal(null)}
        />
      )}

      {selectedModal === 'changeUsername' && (
        <ChangeUsernameModal
          isOpen={true}
          onClose={() => setSelectedModal(null)}
        />
      )}
    </>
  );
};

export default SettingsOverlay;