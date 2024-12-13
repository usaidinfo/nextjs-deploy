'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { authService } from 'lib/services/auth.service';
import type { SignUpRequest } from 'lib/types/auth';


const AnimatedInput = styled('div')({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '40px',
  padding: '2px',
  width: '95%',
  minWidth: '280px',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '150px',
    height: '150%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
    animation: 'rotate 3s linear infinite',
    top: '-25%',
    left: '-50px',
    transform: 'rotate(45deg)',
  },

  '@keyframes rotate': {
    '0%': {
      transform: 'translateX(-100%) rotate(45deg)',
    },
    '100%': {
      transform: 'translateX(200%) rotate(45deg)',
    },
  },
});

const StyledInput = styled('input')({
  width: '95%',
  minWidth: '280px',
  padding: '12px 24px',
  background: 'rgba(24, 24, 27, 0.2)',
  border: 'none',
  outline: 'none',
  color: 'white',
  fontSize: '14px',
  borderRadius: '40px',
  '&::placeholder': {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
  },
});

const Label = styled('label')({
  display: 'block',
  color: 'white',
  marginBottom: '8px',
  fontSize: '14px',
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
  },
});

export default function SignUpForm() {
  const [formData, setFormData] = useState<SignUpRequest>({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsLoading(true);
  
    try {
      const response = await authService.signup({
        username: formData.username,
        password: formData.password,
        email: formData.email,
      });
  
      if (response.success) {
        setShowConfirmation(true);
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Error While Registration:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="w-full">
              {!showConfirmation && (
                  <div className='mb-12'>
                      <h1 className="text-3xl m-0 font-semibold text-white text-center pb-2">
                          Welcome!
                      </h1>
                      <div className='text-xs text-center text-slate-400 font-semibold'>
                          Use these awesome forms to create new account for free.
                      </div>
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 bg-[rgba(24,24,27,0.2)] p-6 rounded-2xl backdrop-blur-sm border border-zinc-800 min-h-[420px] w-[350px] flex flex-col justify-center">
                  {!showConfirmation ? (
                      <>
                          <div className="space-y-4">
                              <div>
                                  <Label className='pl-4'>Name</Label>
                                  <AnimatedInput>
                                      <StyledInput
                                          type="text"
                                          name="username"
                                          value={formData.username}
                                          onChange={handleChange}
                                          placeholder="Enter your name"
                                          required
                                      />
                                  </AnimatedInput>
                              </div>

                              <div>
                                  <Label className='pl-4'>Email</Label>
                                  <AnimatedInput>
                                      <StyledInput
                                          type="email"
                                          name="email"
                                          value={formData.email}
                                          onChange={handleChange}
                                          placeholder="Enter your email"
                                          required
                                      />
                                  </AnimatedInput>
                              </div>

                              <div>
                                  <Label className='pl-4'>Password</Label>
                                  <AnimatedInput>
                                      <StyledInput
                                          type="password"
                                          name="password"
                                          value={formData.password}
                                          onChange={handleChange}
                                          placeholder="Enter your password"
                                          required
                                      />
                                  </AnimatedInput>
                              </div>
                          </div>

                          <div>
                            <p className='text-red-500 text-xs text-center'>{error}</p>
                          </div>

                          <div className='m-1'>
                              <Button
                                  type="submit"
                                  variant="contained"
                                  fullWidth
                                  sx={{
                                      py: 1,
                                      textTransform: 'none',
                                      fontSize: '0.8rem',
                                      fontWeight: "bold",
                                      borderRadius: '12px'
                                  }}
                              >
                                {isLoading ? 'Loading...' : 'SIGN UP'}
                              </Button>
                          </div>

                          <div className="text-center">
                              <Link href="/login" className="inline-block">
                                  <span className="text-sm text-zinc-400">
                                      Already have an account?{' '}
                                  </span>
                                  <span className="text-sm text-blue-500 hover:text-blue-400">
                                      Sign in
                                  </span>
                              </Link>
                          </div>
                      </>
                  ) : (
                      <div className="text-center">
                          <h2 className="text-3xl font-semibold text-white mb-4">
                              Thank you!
                          </h2>
                          <p className="text-slate-400">
                              Please confirm your email address.
                          </p>
                      </div>
                  )}
              </form>
      </div>
    </ThemeProvider>
  );
}