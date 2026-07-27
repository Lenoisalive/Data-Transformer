import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'engineer' | 'analyst';
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials
      );

      if (response.data.success) {
        this.setToken(response.data.data.accessToken);
        this.setUser(response.data.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      const token = this.getToken();
      const response = await axios.post<ApiResponse<User>>(
        `${API_BASE_URL}/users`,
        {
          ...data,
          role: data.role || 'analyst', // Default role
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Reset password (simplified version - no email verification)
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      // First, get user by email
      const token = this.getToken();
      const usersResponse = await axios.get<ApiResponse<User[]>>(
        `${API_BASE_URL}/users`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const user = usersResponse.data.data?.find(
        (u) => u.email === data.email
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Update password
      const response = await axios.patch<ApiResponse>(
        `${API_BASE_URL}/users/${user.id}`,
        { password: data.newPassword },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Password reset failed'
      );
    }
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get<ApiResponse<User>>(
        `${API_BASE_URL}/auth/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // User management
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Check user role
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}

export const authService = new AuthService();

// Axios interceptors
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
