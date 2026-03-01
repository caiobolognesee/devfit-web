<script setup lang="ts">
import { ref } from "vue";
import { http } from "@/api/http";
import { useRouter } from "vue-router";

const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const timezone = ref("America/Sao_Paulo");

const loading = ref(false);
const error = ref("");

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await http.post("/users", {
      name: name.value,
      email: email.value,
      password: password.value,
      timezone: timezone.value,
    });
    router.push("/login");
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? "Register failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main style="max-width: 420px; margin: 48px auto; padding: 16px">
    <h1>Cadastro</h1>

    <form @submit.prevent="onSubmit" style="display: grid; gap: 12px; margin-top: 16px">
      <input v-model="name" placeholder="Nome e sobrenome" />
      <input v-model="email" type="email" placeholder="Email" autocomplete="email" />
      <input
        v-model="password"
        type="password"
        placeholder="Senha"
        autocomplete="new-password"
      />
      <input v-model="timezone" placeholder="Timezone" />
      <button :disabled="loading">{{ loading ? "..." : "Criar conta" }}</button>
      <p v-if="error" style="color: #c00">{{ error }}</p>
    </form>

    <p style="margin-top: 12px">
      Já tem conta?
      <RouterLink to="/login">Entrar</RouterLink>
    </p>
  </main>
</template>
