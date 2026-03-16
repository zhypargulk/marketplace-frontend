<template>
  <div class="admin-offers">
    <router-link to="/admin/products" class="back-link">← Back to products</router-link>
    <h1 class="page-title">Offers — {{ productName || '…' }}</h1>

    <p v-if="!token" class="admin-offers__prompt">
      <router-link to="/admin/login" class="btn btn-primary">Log in</router-link>
      first.
    </p>

    <template v-else>
      <template v-if="productId">
        <section class="admin-offers__section card">
          <h2 class="admin-offers__section-title">Product image</h2>
          <div class="admin-offers__upload">
            <input ref="fileInput" type="file" accept="image/*" class="admin-offers__file" @change="onFileChange" />
            <button type="button" class="btn btn-secondary" @click="fileInput?.click()">Upload image</button>
            <span v-if="uploadStatus" class="admin-offers__upload-status">{{ uploadStatus }}</span>
          </div>
        </section>

        <section class="admin-offers__section card">
          <h2 class="admin-offers__section-title">Add offer</h2>
          <form class="admin-offers__form" @submit.prevent="addOffer">
            <select v-model="newOffer.seller_id" class="form__input" required>
              <option value="">Select seller</option>
              <option v-for="s in sellers" :key="s.id" :value="s.id">{{ s.name }} (★ {{ s.rating ?? '—' }})</option>
            </select>
            <input v-model.number="newOffer.price_amount" type="number" step="0.01" min="0" placeholder="Price" class="form__input" required />
            <input v-model="newOffer.price_currency" type="text" maxlength="3" placeholder="Currency" class="form__input" required />
            <input v-model="newOffer.delivery_date" type="date" class="form__input" />
            <button type="submit" class="btn btn-primary" :disabled="addingOffer">{{ addingOffer ? 'Adding…' : 'Add offer' }}</button>
          </form>
        </section>
      </template>

      <div v-if="loading" class="loading-spinner" role="status" aria-label="Loading" />
      <p v-else-if="!productId" class="admin-offers__empty">Invalid product.</p>
      <p v-else-if="!offers.length" class="admin-offers__empty">No offers for this product.</p>
      <ul v-else class="offers-list">
        <li v-for="o in offers" :key="o.id" class="offers-list__item card">
          <div class="offers-list__content">
            <span class="offers-list__price">{{ formatPrice(o.price_amount) }} {{ o.price_currency }}</span>
            <span class="offers-list__delivery">Delivery {{ formatDate(o.delivery_date) }}</span>
          </div>
          <button type="button" class="btn btn-danger btn--sm" @click="deleteOffer(o.id)">Delete</button>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const productId = ref<string | null>(route.params.id as string);
const productName = ref('');
const token = ref<string | null>(localStorage.getItem('admin_token'));
const offers = ref<{ id: string; price_amount: number; price_currency: string; delivery_date: string }[]>([]);
const sellers = ref<{ id: string; name: string; rating?: number | null }[]>([]);
const loading = ref(true);
const addingOffer = ref(false);
const uploadStatus = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const newOffer = ref({
  seller_id: '' as string,
  price_amount: 0,
  price_currency: 'USD',
  delivery_date: '' as string,
});

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders() {
  return { headers: { Authorization: `Bearer ${token.value}` } };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

async function loadProductName() {
  if (!productId.value || !token.value) return;
  try {
    const res = await axios.get(`${apiBaseUrl}/v1/admin/products/${productId.value}`, authHeaders());
    productName.value = res.data?.name ?? '';
  } catch {
    productName.value = '';
  }
}

async function loadOffers() {
  if (!productId.value || !token.value) return;
  try {
    const res = await axios.get(`${apiBaseUrl}/v1/admin/products/${productId.value}/offers`, authHeaders());
    offers.value = res.data ?? [];
  } catch {
    offers.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadSellers() {
  if (!token.value) return;
  try {
    const res = await axios.get(`${apiBaseUrl}/v1/admin/sellers`, authHeaders());
    sellers.value = res.data ?? [];
  } catch {
    sellers.value = [];
  }
}

async function addOffer() {
  if (!productId.value || !token.value || !newOffer.value.seller_id) return;
  addingOffer.value = true;
  try {
    const payload = {
      seller_id: newOffer.value.seller_id,
      price_amount: newOffer.value.price_amount,
      price_currency: newOffer.value.price_currency,
      delivery_date: newOffer.value.delivery_date || null,
    };
    const res = await axios.post(
      `${apiBaseUrl}/v1/admin/products/${productId.value}/offers`,
      payload,
      authHeaders()
    );
    offers.value = [...offers.value, res.data];
    newOffer.value = { seller_id: '', price_amount: 0, price_currency: 'USD', delivery_date: '' };
  } catch {
    alert('Failed to add offer');
  } finally {
    addingOffer.value = false;
  }
}

async function deleteOffer(offerId: string) {
  if (!token.value || !confirm('Delete this offer?')) return;
  try {
    await axios.delete(`${apiBaseUrl}/v1/admin/offers/${offerId}`, authHeaders());
    offers.value = offers.value.filter((o) => o.id !== offerId);
  } catch {
    alert('Failed to delete offer');
  }
}

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !productId.value || !token.value) return;
  uploadStatus.value = 'Uploading…';
  try {
    const fd = new FormData();
    fd.append('file', file);
    await axios.post(`${apiBaseUrl}/v1/admin/products/${productId.value}/image`, fd, {
      ...authHeaders(),
      headers: {
        ...authHeaders().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    uploadStatus.value = 'Uploaded';
    target.value = '';
  } catch {
    uploadStatus.value = 'Upload failed';
  }
}

onMounted(async () => {
  if (!token.value) {
    loading.value = false;
    return;
  }
  await loadProductName();
  await loadSellers();
  await loadOffers();
});
</script>

<style scoped>
.admin-offers {
  max-width: 640px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}
.back-link:hover {
  color: var(--color-accent);
}

.admin-offers__prompt,
.admin-offers__empty {
  color: var(--color-text-muted);
  margin: 0;
}
.admin-offers__prompt .btn {
  margin-right: 0.5rem;
}

.admin-offers__section {
  padding: 1rem;
  margin-bottom: 1rem;
}
.admin-offers__section-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--color-text-muted);
}
.admin-offers__upload {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.admin-offers__file {
  display: none;
}
.admin-offers__upload-status {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.admin-offers__form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.admin-offers__form .form__input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
}
.admin-offers__form select.form__input {
  min-width: 160px;
}

.offers-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.offers-list__item {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.offers-list__content {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.offers-list__price {
  font-weight: 600;
  color: var(--color-accent);
}
.offers-list__delivery {
  font-size: 0.875rem;
  color: var(--color-text-muted);
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
