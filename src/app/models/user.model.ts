export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  requiresVerification?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: Date;
}
