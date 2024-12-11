'use client'
import React, { useState } from 'react';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { useAuth } from 'lib/hooks/useAuth';
import SettingsOverlay from './navbar/SettingsOverlay';
import AddSensorSetup from './AddSensorSetup';

const Navbar = () => {
  const { handleLogout } = useAuth();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [showAddSensor, setShowAddSensor] = useState(false);


  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between">
      <div className="flex-1"></div>
      <div className="flex items-center gap-6 text-sm">
      <button 
            className="text-white hover:text-slate-200 flex items-center gap-2"
            onClick={() => setShowAddSensor(true)}
          >
            <AddCircleOutlineOutlinedIcon className="w-5 h-5" />
            Add Sensor
          </button>
        <button 
          onClick={handleLogout}
          className="text-white hover:text-slate-200 flex items-center gap-2"
        >
          <PersonIcon className="w-5 h-5" />
          Logout
        </button>
        <button 
        onClick={handleSettingsClick}
        className="text-white hover:text-slate-200">
          <SettingsOutlinedIcon className="w-5 h-5" />
        </button>
        <SettingsOverlay 
        anchorEl={settingsAnchorEl}
        onClose={() => setSettingsAnchorEl(null)}
      />
        <button className="text-white hover:text-slate-200">
          <NotificationsNoneOutlinedIcon className="w-5 h-5" />
        </button>
      </div>

      {showAddSensor && (
        <AddSensorSetup onClose={() => setShowAddSensor(false)} />
      )}
    </div>
  );
};

export default Navbar;