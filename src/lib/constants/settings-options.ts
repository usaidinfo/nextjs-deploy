// src/lib/constants/settings-options.ts
export interface SettingsOption {
    id: string;
    label: string;
    iconType: 'delete' | 'password' | 'email' | 'username';
    modalType: 'deleteSensor' | 'deleteLocation' | 'deletePlant' | 'changePassword' | 'changeEmail' | 'changeUsername';
  }
  
  export const getSettingsOptions = (hasActiveSensor: boolean, hasActivePlant: boolean, hasActiveLocation: boolean): SettingsOption[] => {
    const options: SettingsOption[] = [
        {
            id: 'changePassword',
            label: 'Change Password',
            iconType: 'password',
            modalType: 'changePassword'
          },
          {
            id: 'changeEmail',
            label: 'Change Email',
            iconType: 'email',
            modalType: 'changeEmail'
          },
          {
            id: 'changeUsername',
            label: 'Change Username',
            iconType: 'username',
            modalType: 'changeUsername'
          },
    ];

    if (hasActiveLocation) {
        options.unshift({
            id: 'deleteLocation',
            label: 'Delete Location',
            iconType: 'delete',
            modalType: 'deleteLocation'
          })
    }

    if (hasActivePlant) {
        options.unshift({
          id: 'deletePlant',
          label: 'Delete Plant',
          iconType: 'delete',
          modalType: 'deletePlant'
        });
      }
  
    if (hasActiveSensor) {
      options.unshift({
        id: 'deleteSensor',
        label: 'Delete Sensor',
        iconType: 'delete',
        modalType: 'deleteSensor'
      });
    }
  
    return options;
  };