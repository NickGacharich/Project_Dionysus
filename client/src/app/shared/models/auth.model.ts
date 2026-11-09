
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    displayName?: string;
    avatar?: string;
    createdAt?: string;
  }
  
  export interface AuthResponse {
    message: string;
    user: AuthUser;
    token: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }