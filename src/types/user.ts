

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  verification_code: string | null;
  is_verified: boolean;
  verification_expiry: Date | null;
  created_at: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface VerifyEmailDTO {
  email: string;
  code: string;
}

