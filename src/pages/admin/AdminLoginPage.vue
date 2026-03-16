<template>
  <div class="admin-login">
    <div class="admin-login__card card">
      <h1 class="page-title">Admin Login</h1>
      <form @submit.prevent="onSubmit" class="admin-login__form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="admin@example.com" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required placeholder="••••••••" />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" class="btn btn-primary admin-login__submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { apiBaseUrl } from '../../shared/config';
import { useAuth } from '../../features/auth';

const router = useRouter();
const { setToken } = useAuth();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

async function onSubmit() {
  error.value = null;
  loading.value = true;
  try {
    const res = await axios.post<{ access_token: string }>(`${apiBaseUrl}/v1/admin/auth/login`, {
      email: email.value,
      password: password.value,
    });
    setToken(res.data.access_token);
    await router.push('/admin/products');
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-login {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 0;
}

.admin-login__card {
  padding: 2rem;
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}
.form-group input {
  padding: 0.625rem 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.form-group input::placeholder {
  color: var(--color-text-muted);
}
.form-group input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}

.admin-login__submit {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.25rem;
}
</style>
