<template>
  <div class="admin-products">
    <h1 class="page-title">Admin — Products</h1>

    <p v-if="!token" class="admin-products__prompt">
      <router-link to="/admin/login" class="btn btn-primary">Log in</router-link>
      to manage products.
    </p>

    <template v-else>
      <div class="admin-products__toolbar">
        <router-link to="/admin/products/new" class="btn btn-primary">Add product</router-link>
      </div>
      <div v-if="loading" class="loading-spinner" role="status" aria-label="Loading" />
      <p v-else-if="!products.length" class="admin-products__empty">No products yet.</p>
      <ul v-else class="admin-products__list">
        <li v-for="p in products" :key="p.id" class="admin-products__row card">
          <router-link :to="`/admin/products/${p.id}/offers`" class="admin-products__link">{{ p.name }}</router-link>
          <div class="admin-products__actions">
            <router-link :to="`/admin/products/${p.id}/edit`" class="btn btn-secondary btn--sm">Edit</router-link>
            <button type="button" class="btn btn-danger btn--sm" @click="deleteProduct(p.id, p.name)">Delete</button>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';

const token = ref<string | null>(localStorage.getItem('admin_token'));
const products = ref<{ id: string; name: string }[]>([]);
const loading = ref(true);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders() {
  return { headers: { Authorization: `Bearer ${token.value}` } };
}

async function loadProducts() {
  if (!token.value) return;
  try {
    const res = await axios.get(`${apiBaseUrl}/v1/admin/products`, authHeaders());
    products.value = res.data ?? [];
  } catch {
    products.value = [];
  } finally {
    loading.value = false;
  }
}

async function deleteProduct(id: string, name: string) {
  if (!token.value || !confirm(`Delete product "${name}"?`)) return;
  try {
    await axios.delete(`${apiBaseUrl}/v1/admin/products/${id}`, authHeaders());
    products.value = products.value.filter((p) => p.id !== id);
  } catch {
    alert('Failed to delete');
  }
}

onMounted(() => {
  if (!token.value) {
    loading.value = false;
    return;
  }
  loadProducts();
});
</script>

<style scoped>
.admin-products__prompt {
  margin: 0;
  color: var(--color-text-muted);
}
.admin-products__prompt .btn {
  margin-right: 0.5rem;
}

.admin-products__empty {
  color: var(--color-text-muted);
  margin: 0;
}

.admin-products__toolbar {
  margin-bottom: 1rem;
}

.admin-products__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.admin-products__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.admin-products__link {
  flex: 1;
  min-width: 0;
  color: var(--color-text);
  font-weight: 500;
  transition: color 0.15s ease;
}
.admin-products__link:hover {
  color: var(--color-accent);
}

.admin-products__actions {
  display: flex;
  gap: 0.5rem;
}

.btn--sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8125rem;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
  border: none;
}
.btn-danger:hover {
  background: #b91c1c;
}
</style>
