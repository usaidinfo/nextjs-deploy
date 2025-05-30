// src/lib/services/auth.service.ts
import { LoginRequest, AuthResponse, SignUpRequest, PasswordResetRequest } from 'lib/types/auth';
// import {  SignUpResponse,  } from 'lib/types/auth';


class AuthService {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          message: 'Login failed. Please try again.',
        };
      }
    }
  
    async signup(userData: SignUpRequest): Promise<AuthResponse> {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Signup error:', error);
        return {
          success: false,
          message: 'Signup failed. Please try again.',
        };
      }
    }

    async resetPassword(data: PasswordResetRequest): Promise<AuthResponse> {
      try {
        const response = await fetch('/api/auth/password-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        const responseData = await response.json();
        return responseData;
      } catch (error) {
        console.error('Password reset error:', error);
        return {
          success: false,
          message: 'Password reset failed. Please try again.',
        };
      }
    }
  }
  
  export const authService = new AuthService();