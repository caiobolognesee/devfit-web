export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  timezone?: string;
}

export interface AuthState {
  accessToken: string;
  user: AuthUser | null;
}

export const state = (): AuthState => ({
  accessToken: localStorage.getItem("accessToken") ?? "",
  user: null,
});
