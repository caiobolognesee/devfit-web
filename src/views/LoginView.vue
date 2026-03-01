<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push("/");
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? "Login failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main style="max-width: 420px; margin: 48px auto; padding: 16px">
    <h1>Login</h1>

    <form @submit.prevent="onSubmit" style="display: grid; gap: 12px; margin-top: 16px">
      <input v-model="email" type="email" placeholder="Email" autocomplete="email" />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        autocomplete="current-password"
      />
      <button :disabled="loading">{{ loading ? "..." : "Entrar" }}</button>
      <p v-if="error" style="color: #c00">{{ error }}</p>
    </form>

    <p style="margin-top: 12px">
      Não tem conta?
      <RouterLink to="/register">Criar conta</RouterLink>
    </p>
  </main>
</template>
