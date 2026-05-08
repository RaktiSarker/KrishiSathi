import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// In production (Vercel) frontend & backend are on the same domain → use /api
// In development → local Express server on port 5000
const API_BASE = import.meta.env.PROD
  ? "/api"
  : (import.meta.env.VITE_API_BASE || "http://localhost:5000/api");

export interface User {
  _id: string;
  name: string;
  phone: string;
  country: string;
  countryCode: string;
  city: string;
  address: string;
  profilePic: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: FormData) => Promise<void>;
}

export interface RegisterData {
  name: string;
  phone: string;
  password: string;
  country: string;
  countryCode: string;
  city: string;
  address: string;
  profilePic?: File | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ks_token"));
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("ks_token");
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem("ks_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) verifyToken(token);
    else setIsLoading(false);
  }, [token, verifyToken]);

  const login = async (phone: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "লগইন ব্যর্থ");
    localStorage.setItem("ks_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (formData: RegisterData) => {
    const fd = new FormData();
    fd.append("name",        formData.name);
    fd.append("phone",       formData.phone);
    fd.append("password",    formData.password);
    fd.append("country",     formData.country);
    fd.append("countryCode", formData.countryCode);
    fd.append("city",        formData.city);
    fd.append("address",     formData.address);
    if (formData.profilePic) fd.append("profilePic", formData.profilePic);

    const res = await fetch(`${API_BASE}/auth/register`, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "রেজিস্ট্রেশন ব্যর্থ");
    localStorage.setItem("ks_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("ks_token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (fd: FormData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "আপডেট ব্যর্থ");
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export { API_BASE };
