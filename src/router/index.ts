import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores";

import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import DashboardView from "@/views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", name: "login", component: LoginView, meta: { public: true } },
    { path: "/register", name: "register", component: RegisterView, meta: { public: true } },
    { path: "/", name: "dashboard", component: DashboardView },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Ensure auth state was loaded from storage
  if (!auth.isReady) auth.bootstrap();

  // Allow public routes
  if (to.meta.public) return true;

  // Block private routes
  if (!auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // Ensure user object exists (optional, depends on your backend)
  if (!auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      auth.logout();
      return { name: "login" };
    }
  }

  return true;
});

export default router;
