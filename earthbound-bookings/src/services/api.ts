import type { User, Class, Booking, CreateClassData, CreateBookingData } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Token management
const TOKEN_KEY = 'auth_token';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

// Helper to make authenticated requests with JWT
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = tokenManager.getToken();
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
};

// Auth API
export const authApi = {
  initiateGoogleLogin: (role: 'customer' | 'studio-owner' = 'customer') => {
    window.location.href = `${API_BASE_URL}/auth/google?role=${role}`;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await authFetch(`${API_BASE_URL}/auth/me`);
    if (!response.ok) throw new Error("Failed to get current user");
    return response.json();
  },
  
  logout: async () => {
    tokenManager.removeToken();
    window.location.href = "/";
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await authFetch(`${API_BASE_URL}/api/users`);
    if (!response.ok) throw new Error("Failed to get users");
    return response.json();
  },
  
  getById: async (id: number): Promise<User> => {
    const response = await authFetch(`${API_BASE_URL}/api/users/${id}`);
    if (!response.ok) throw new Error("Failed to get user");
    return response.json();
  },
};

// Classes API
export const classesApi = {
  getAll: async (): Promise<Class[]> => {
    const response = await authFetch(`${API_BASE_URL}/api/classes`);
    if (!response.ok) throw new Error("Failed to get classes");
    return response.json();
  },
  
  getById: async (id: number): Promise<Class> => {
    const response = await authFetch(`${API_BASE_URL}/api/classes/${id}`);
    if (!response.ok) throw new Error("Failed to get class");
    return response.json();
  },
  
  getUpcoming: async (): Promise<Class[]> => {
    const response = await authFetch(`${API_BASE_URL}/api/classes/upcoming`);
    if (!response.ok) throw new Error("Failed to get upcoming classes");
    return response.json();
  },
  
  create: async (data: CreateClassData): Promise<Class> => {
    const response = await authFetch(`${API_BASE_URL}/api/classes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create class");
    return response.json();
  },
  
  update: async (id: number, data: Partial<CreateClassData>): Promise<Class> => {
    const response = await authFetch(`${API_BASE_URL}/api/classes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update class");
    return response.json();
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await authFetch(`${API_BASE_URL}/api/classes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete class");
  },
};

// Bookings API
export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await authFetch(`${API_BASE_URL}/api/bookings`);
    if (!response.ok) throw new Error("Failed to get bookings");
    return response.json();
  },
  
  getByUserId: async (userId: number): Promise<Booking[]> => {
    const response = await authFetch(`${API_BASE_URL}/api/bookings/user/${userId}`);
    if (!response.ok) throw new Error("Failed to get user bookings");
    return response.json();
  },
  
  getByClassId: async (classId: number): Promise<Booking[]> => {
    const response = await authFetch(`${API_BASE_URL}/api/bookings/class/${classId}`);
    if (!response.ok) throw new Error("Failed to get class bookings");
    return response.json();
  },
  
  create: async (data: CreateBookingData): Promise<Booking> => {
    const response = await authFetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create booking");
    }
    return response.json();
  },
  
  cancel: async (id: number): Promise<void> => {
    const response = await authFetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to cancel booking");
  },
};