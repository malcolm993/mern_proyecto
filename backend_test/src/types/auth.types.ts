// src/types/auth.types.ts
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
  company?: string;
  businessArea?: string;
  interests?: string[];
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      email: string;
      name: string;
      role: 'admin' | 'user';
      company?: string;
      businessArea?: string;
      interests?: string[];
      bio?: string;
    };
    token?: string;
  };
  error?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}
