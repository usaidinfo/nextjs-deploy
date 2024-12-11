export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    token?: string;
    message?: string;
  }
  
  export interface SignUpRequest {
    username: string;
    password: string;
    email: string;
  }
  
  export interface SignUpResponse {
    success: boolean;
    message?: string;
  }