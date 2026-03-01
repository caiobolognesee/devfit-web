export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  timezone?: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isBootstrapped: boolean;
}

const AUTH_STORAGE_KEY = "devfit.auth";

function readPersistedAuth(): Pick<AuthState, "accessToken" | "refreshToken" | "user"> {
  // New format: single JSON blob
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as {
        accessToken?: string | null;
        refreshToken?: string | null;
        user?: AuthUser | null;
      };

      return {
        accessToken: parsed.accessToken ?? null,
        refreshToken: parsed.refreshToken ?? null,
        user: parsed.user ?? null,
      };
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // Legacy fallback: old accessToken key
  const legacyAccessToken = localStorage.getItem("accessToken");
  return {
    accessToken: legacyAccessToken ?? null,
    refreshToken: null,
    user: null,
  };
}


const persisted = readPersistedAuth();

export const state = (): AuthState => ({
  accessToken: persisted.accessToken,
  refreshToken: persisted.refreshToken,
  user: persisted.user,
  isBootstrapped: false,
});
