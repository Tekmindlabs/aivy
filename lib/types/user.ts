export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
