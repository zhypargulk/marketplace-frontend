<template>
  <div class="admin-product-form">
    <router-link to="/admin/products" class="back-link">
      ← Back to products
    </router-link>
    <h1 class="page-title">{{ isEdit ? 'Edit product' : 'Create product' }}</h1>

    <p v-if="!token" class="admin-product-form__prompt">
      <router-link to="/admin/login" class="btn btn-primary">Log in</router-link>
      first.
    </p>

    <form v-else class="form card" @submit.prevent="submit">
      <div class="form__row">
        <label class="form__label" for="name">Name</label>
        <input id="name" v-model="form.name" type="text" class="form__input" required />
      </div>
      <div class="form__row form__row--inline">
        <div>
          <label class="form__label" for="price_amount">Price</label>
          <input id="price_amount" v-model.number="form.price_amount" type="number" step="0.01" min="0" class="form__input" required />
        </div>
        <div>
          <label class="form__label" for="price_currency">Currency</label>
          <input id="price_currency" v-model="form.price_currency" type="text" maxlength="3" class="form__input" required />
        </div>
      </div>
      <div class="form__row">
        <label class="form__label" for="stock">Stock</label>
        <input id="stock" v-model.number="form.stock" type="number" min="0" class="form__input" required />
      </div>

      <div class="form__section">
        <h2 class="form__section-title">Attributes</h2>
        <div v-for="(attr, idx) in form.attributes" :key="idx" class="form__attr-row">
          <input v-model="attr.key" type="text" placeholder="Key" class="form__input form__input--sm" />
          <input v-model="attr.value" type="text" placeholder="Value" class="form__input form__input--sm" />
          <button type="button" class="btn btn-secondary btn--sm" @click="removeAttr(idx)">Remove</button>
        </div>
        <button type="button" class="btn btn-secondary" @click="addAttr">+ Add attribute</button>
      </div>

      <template v-if="isEdit && productId">
        <div class="form__section">
          <h2 class="form__section-title">Product image</h2>
          <div class="form__upload">
            <input ref="fileInput" type="file" accept="image/*" class="form__file" @change="onFileChange" />
            <button type="button" class="btn btn-secondary" @click="triggerUpload">Choose image</button>
            <span v-if="uploadStatus" class="form__upload-status">{{ uploadStatus }}</span>
          </div>
        </div>
      </template>

      <div class="form__actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving…' : (isEdit ? 'Save' : 'Create') }}
        </button>
        <router-link v-if="isEdit" :to="`/admin/products/${productId}/offers`" class="btn btn-secondary">
          Manage offers
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const productId = computed(() => route.params.id as string);
const isEdit = computed(() => route.name === 'AdminProductEdit');

const token = ref<string | null>(localStorage.getItem('admin_token'));
const saving = ref(false);
const uploadStatus = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const form = ref({
  name: '',
  price_amount: 0,
  price_currency: 'USD',
  stock: 0,
  attributes: [] as { key: string; value: string }[],
});

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function authHeaders() {
  return { headers: { Authorization: `Bearer ${token.value}` } };
}

function addAttr() {
  form.value.attributes.push({ key: '', value: '' });
}
function removeAttr(idx: number) {
  form.value.attributes.splice(idx, 1);
}

async function loadProduct() {
  if (!productId.value || !token.value) return;
  try {
    const res = await axios.get(`${apiBaseUrl}/v1/admin/products/${productId.value}`, authHeaders());
    const p = res.data;
    form.value = {
      name: p.name,
      price_amount: p.price_amount,
      price_currency: p.price_currency,
      stock: p.stock,
      attributes: Array.isArray(p.attributes) ? p.attributes.map((a: { key: string; value: string }) => ({ ...a })) : [],
    };
  } catch {
    router.push('/admin/products');
  }
}

async function submit() {
  if (!token.value) return;
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      price_amount: form.value.price_amount,
      price_currency: form.value.price_currency,
      stock: form.value.stock,
      attributes: form.value.attributes.filter((a) => a.key.trim() || a.value.trim()).map((a) => ({ key: a.key.trim() || 'key', value: a.value.trim() || '' })),
    };
    if (isEdit.value && productId.value) {
      await axios.put(`${apiBaseUrl}/v1/admin/products/${productId.value}`, payload, authHeaders());
      router.push('/admin/products');
    } else {
      const res = await axios.post(`${apiBaseUrl}/v1/admin/products`, payload, authHeaders());
      router.push(`/admin/products/${res.data.id}/edit`);
    }
  } catch (e) {
    console.error(e);
    alert('Failed to save');
  } finally {
    saving.value = false;
  }
}

function triggerUpload() {
  fileInput.value?.click();
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

onMounted(() => {
  if (isEdit.value && productId.value) loadProduct();
  else if (!isEdit.value) addAttr();
});
</script>

<style scoped>
.admin-product-form {
  max-width: 560px;
}

.back-link {
  display: inline-flex;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}
.back-link:hover {
  color: var(--color-accent);
}

.admin-product-form__prompt {
  margin: 0;
  color: var(--color-text-muted);
}

.form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form__row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form__row--inline {
  flex-direction: row;
  gap: 1rem;
}
.form__row--inline > div {
  flex: 1;
}
.form__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}
.form__input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
}
.form__input--sm {
  max-width: 160px;
}
.form__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form__section-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: var(--color-text-muted);
}
.form__attr-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.form__upload {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.form__file {
  display: none;
}
.form__upload-status {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.btn--sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8125rem;
}
</style>
