import api from "./api";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  numberphone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function register(data: RegisterData) {
  const res = await api.post("/auth/register", data);
  return res.data;
}

export async function login(data: LoginData) {
  const res = await api.post("/auth/login", data);
  return res.data;
}


export function loginWithGoogle() {
  window.location.href = "http://localhost:3000/api/auth/google";
}

export function handleGoogleCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    localStorage.setItem("auth_token", token);
  }
  return token;
}
