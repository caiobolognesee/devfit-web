import type { AuthUser } from "./state";
import * as authService from "@/services/auth/auth.service";

const AUTH_STORAGE_KEY = "devfit.auth";

export const actions = {
  // Fetch authenticated user from API
  async fetchMe(): Promise<void> {
    const user = await authService.getMe();
    this.user = user;
  },

  // Save session to localStorage
  persist(): void {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: this.user,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      })
    );
  },

  // Restore session from localStorage
  bootstrap(): void {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      this.isBootstrapped = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        user?: AuthUser | null;
        accessToken?: string | null;
        refreshToken?: string | null;
      };

      this.user = parsed.user ?? null;
      this.accessToken = parsed.accessToken ?? null;
      this.refreshToken = parsed.refreshToken ?? null;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
    } finally {
      this.isBootstrapped = true;
    }
  },

  // Perform login and persist session
  async login(payload: {
    email: string;
    password: string;
  }): Promise<void> {
    const data = await authService.login(payload);

    this.user = data.user;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;

    this.persist();
  },

  // Refresh access token and persist
  async refresh(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("Missing refresh token");
    }

    const data = await authService.refresh(this.refreshToken);

    this.accessToken = data.accessToken;

    if (data.refreshToken) {
      this.refreshToken = data.refreshToken;
    }

    this.persist();

    return this.accessToken!;
  },

  // Clear session
  logout(): void {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;

    localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
