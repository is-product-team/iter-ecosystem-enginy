import { RoleTag } from '@iter/shared';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  photoUrl?: string | null;
  phone?: string | null;
  centerId?: number | null;
  center?: {
    centerId: number;
    name: string;
    centerCode?: string;
  };
  role: {
    name: RoleTag;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al iniciar sesión');
  }

  const data = await res.json();

  // Store user in localStorage, but cookie handles the token
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    // Session is handled by cookie, API logout clears it
    window.location.href = '/login';
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    // Note: We no longer check for 'token' in localStorage as it's in a cookie
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Basic validation: ensure the user has a valid role structure
        if (!user || !user.role || typeof user.role.name !== 'string') {
          console.warn("Malformed user data in localStorage, clearing session.");
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          return null;
        }
        return user;
      } catch (e) {
        console.error("Error parsing user data", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    }
  }
  return null;
}
