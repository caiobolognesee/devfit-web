import type { AuthState } from "./state";

export const getters = {
  // Returns true if accessToken exists
  isAuthenticated: (state: AuthState): boolean => {
    return Boolean(state.accessToken);
  },

  // Returns authenticated user
  authUser: (state: AuthState) => {
    return state.user;
  },

  // Returns user email (if logged in)
  userEmail: (state: AuthState): string | null => {
    return state.user?.email ?? null;
  },

  // Returns true when store finished bootstrap process
  isReady: (state: AuthState): boolean => {
    return state.isBootstrapped;
  },
};
