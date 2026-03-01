import { http, httpPublic } from "@/services/api/http";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  timezone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

// Login without auth headers
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await httpPublic.post<LoginResponse>("/login", payload);
  return data;
}

// Fetch current user with Bearer token
export async function getMe(): Promise<AuthUser> {
  const { data } = await http.get<AuthUser>("/me");
  return data;
}

// Refresh tokens without auth interceptors
export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await httpPublic.post<RefreshResponse>("/refresh", { refreshToken });
  return data;
}
