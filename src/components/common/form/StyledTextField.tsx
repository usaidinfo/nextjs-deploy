// src/components/common/form/StyledTextField.tsx
import { styled, TextField } from '@mui/material';

export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: '1px',
      borderRadius: '12px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#008500',
      borderWidth: '2px',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 20px',
    fontSize: '14px',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.3)',
      opacity: 1,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    '&.Mui-focused': {
      color: '#008500',
    },
  },
});