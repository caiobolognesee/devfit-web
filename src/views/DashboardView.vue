<script setup lang="ts">
import { useAuthStore } from "@/stores";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <main style="max-width: 720px; margin: 48px auto; padding: 16px">
    <h1>Dashboard</h1>

    <pre style="margin-top: 16px; background: #f6f6f6; padding: 12px; border-radius: 8px"
      >{{ auth.user }}
    </pre>

    <button style="margin-top: 16px" @click="logout">Sair</button>
  </main>
</template>
