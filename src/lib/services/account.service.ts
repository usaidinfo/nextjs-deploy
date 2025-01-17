import { AuthResponse } from "lib/types/auth";

// src/lib/services/account.service.ts
class AccountService {
    private baseUrl = '/api/account';
  
    async changePassword(password: string): Promise<AuthResponse> {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return { success: false, message: 'No authentication token found' };
        }
  
        const response = await fetch(`${this.baseUrl}/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': token,
          },
          body: JSON.stringify({ password }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Change password error:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to change password' 
        };
      }
    }
  
    async changeUsername(newUsername: string): Promise<AuthResponse> {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return { success: false, message: 'No authentication token found' };
        }
  
        const response = await fetch(`${this.baseUrl}/change-username`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': token,
          },
          body: JSON.stringify({ new_username: newUsername }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Change username error:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to change username' 
        };
      }
    }
  
    async changeEmail(newEmail: string): Promise<AuthResponse> {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return { success: false, message: 'No authentication token found' };
        }
  
        const response = await fetch(`${this.baseUrl}/change-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Token': token,
          },
          body: JSON.stringify({ new_mail: newEmail }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Change email error:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to change email' 
        };
      }
    }
  }
  
  export const accountService = new AccountService();