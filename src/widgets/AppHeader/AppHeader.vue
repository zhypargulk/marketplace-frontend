<template>
  <header class="app-header">
    <div class="app-header-inner">
      <router-link to="/" class="app-logo">Marketplace</router-link>
      <nav class="app-nav">
        <router-link to="/">Products</router-link>
        <router-link to="/admin/products">Admin</router-link>
        <template v-if="isAdmin">
          <span class="app-nav__admin-badge">Admin</span>
          <button type="button" class="app-nav__logout btn btn-ghost" @click="logout">Log out</button>
        </template>
        <router-link v-else to="/admin/login">Log in</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../../features/auth';

const router = useRouter();
const { isAdmin, setToken } = useAuth();

function logout() {
  setToken(null);
  router.push('/');
}
</script>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.app-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.app-logo {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-text);
}
.app-logo:hover {
  color: var(--color-accent);
}
.app-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.app-nav a {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}
.app-nav a:hover {
  color: var(--color-accent);
}
.app-nav__admin-badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  background: rgba(13, 148, 136, 0.12);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
.app-nav__logout {
  font-size: 0.9375rem;
  padding: 0.375rem 0.75rem;
}
</style>
