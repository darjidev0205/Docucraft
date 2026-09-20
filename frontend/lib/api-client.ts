const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('docucraft_auth_token');
  }

  setToken(token: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('docucraft_auth_token', token);
    } else {
      localStorage.removeItem('docucraft_auth_token');
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errJson = await response.json();
        errorMessage = errJson.error || errJson.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    // If 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file (multipart/form-data)
  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to upload asset');
    }

    return response.json();
  }

  // Protected PDF Download stream
  async downloadPdf(documentId: string, documentPayload?: any): Promise<Blob> {
    const url = `${API_BASE}/documents/${documentId}/download`;
    const token = this.getToken();

    if (!token) {
      const authError: any = new Error('You must be logged in to download this document.');
      authError.status = 401;
      throw authError;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: documentPayload ? JSON.stringify(documentPayload) : JSON.stringify({}),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate PDF';
      try {
        const errJson = await response.json();
        errorMessage = errJson.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();
