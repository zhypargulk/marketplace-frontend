/**
 * Auth feature — public API (FSD).
 */
import { ref, computed } from 'vue';

const token = ref<string | null>(localStorage.getItem('admin_token'));

export function useAuth() {
  const isAdmin = computed(() => !!token.value);

  function setToken(value: string | null) {
    if (value !== null) {
      localStorage.setItem('admin_token', value);
    } else {
      localStorage.removeItem('admin_token');
    }
    token.value = value;
  }

  function authHeaders(): { headers: { Authorization: string } } {
    return {
      headers: { Authorization: `Bearer ${token.value}` },
    };
  }

  return { token, isAdmin, setToken, authHeaders };
}
