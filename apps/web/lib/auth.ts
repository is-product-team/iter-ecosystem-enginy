
export interface User {
  id: number;
  id_usuari: number;
  email: string;
  nom_complet: string;
  url_foto?: string | null;
  id_centre?: number;
  centre?: {
    id_centre: number;
    nom: string;
  };
  rol: {
    nom_rol: 'ADMIN' | 'COORDINADOR' | 'PROFESSOR';
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
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user data", e);
        return null;
      }
    }
  }
  return null;
}
