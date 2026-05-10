/**
 * API Configuration Utility
 * Provides consistent API endpoint access across the application
 */

export const getApiUrl = (): string => {
  // Use environment variable if available (set by build tool)
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback based on environment
  if (import.meta.env.MODE === 'production') {
    // In production, API should be configured via environment variable
    console.warn('VITE_API_URL not set in production. Using default.');
    return window.location.origin;
  }
  
  // Development fallback
  return 'http://localhost:3000';
};

/**
 * Wrapper for API calls that handles URL management
 */
export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl();
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get the current base URL (useful for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Example usage in components:
 * 
 * import { apiClient } from '@/services/api-config';
 * 
 * // In your component:
 * const userData = await apiClient.get('/api/user/usage/user123');
 * await apiClient.post('/api/user/increment-usage', { userId: 'user123', feature: 'resumeAnalyses' });
 */
