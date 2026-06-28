import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { auth } from './firebase';

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'https://api.vendoo.app') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          console.error('Failed to get auth token:', err);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.warn('Unauthorized - token may be expired');
          auth.signOut().catch(e => console.error('Signout error:', e));
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async patch<T = any>(url: string, data?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as any;
      const message = data?.message || error.message;

      console.error(`API Error [${status}]: ${message}`);

      switch (status) {
        case 400:
          console.error('Bad request:', data);
          break;
        case 401:
          console.error('Unauthorized');
          break;
        case 403:
          console.error('Forbidden');
          break;
        case 404:
          console.error('Not found');
          break;
        case 429:
          console.error('Rate limited');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Unknown error');
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Singleton instance
export const httpClient = new HttpClient(process.env.EXPO_PUBLIC_API_URL || 'https://api.vendoo.app');
