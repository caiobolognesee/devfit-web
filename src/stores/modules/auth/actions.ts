import { http } from "@/api/http";
import type { AuthUser } from "./state";

export const actions = {
  setToken(token: string) {
    this.accessToken = token;
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  },

  async login(email: string, password: string) {
    const { data } = await http.post<{ accessToken: string }>("/auth/login", {
      email,
      password,
    });

    this.setToken(data.accessToken);
    await this.fetchMe();
  },

  async fetchMe() {
    if (!this.accessToken) return;
    const { data } = await http.get<AuthUser>("/users/me");
    this.user = data;
  },

  logout() {
    this.setToken("");
    this.user = null;
  },
};
