<template>
  <div class="product-details">
    <router-link to="/" class="back-link">← Back to products</router-link>

    <div v-if="isLoading" class="loading-spinner" role="status" aria-label="Loading" />
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <template v-else-if="product">
      <div class="product-details__hero card">
        <div class="product-details__media">
          <img
            v-if="showImage"
            :src="imageUrl!"
            :alt="product.name"
            class="product-details__image"
            @error="imageLoadError = true"
          />
          <div v-else class="product-details__placeholder">
            <span class="product-details__placeholder-icon">◇</span>
            <span class="product-details__placeholder-text">Product photo</span>
          </div>
        </div>
        <div class="product-details__main">
          <h1 class="page-title product-details__title">{{ product.name }}</h1>

          <section class="product-details__section">
            <h2 class="product-details__section-title">Attributes</h2>
            <dl v-if="product.attributes?.length" class="product-details__attrs">
              <div v-for="attr in product.attributes" :key="String(attr.key)" class="product-details__attr">
                <dt>{{ attr.key }}</dt>
                <dd>{{ attr.value }}</dd>
              </div>
            </dl>
            <p v-else class="product-details__empty">No attributes.</p>
          </section>

          <section class="product-details__section">
            <h2 class="product-details__section-title">Offers</h2>
            <div v-if="product.offers?.length" class="offers-controls">
              <span class="offers-controls__label">Sort by:</span>
              <button
                type="button"
                class="offers-controls__btn"
                :class="{ 'offers-controls__btn--active': offersSort === 'price' }"
                @click="setOffersSort('price')"
              >
                Price
              </button>
              <button
                type="button"
                class="offers-controls__btn"
                :class="{ 'offers-controls__btn--active': offersSort === 'delivery_date' }"
                @click="setOffersSort('delivery_date')"
              >
                Delivery date
              </button>
            </div>
            <ul v-if="product.offers?.length" class="offers-list">
              <li v-for="o in product.offers" :key="String(o.id)" class="offers-list__item card">
                <div class="offers-list__main">
                  <span class="offers-list__price">{{ formatPrice(o.price_amount) }} {{ o.price_currency }}</span>
                  <span class="offers-list__delivery">
                    {{ o.delivery_date != null ? `Delivery ${formatDate(o.delivery_date)}` : '—' }}
                  </span>
                </div>
                <div class="offers-list__seller">
                  <span class="offers-list__seller-name">{{ o.seller_name ?? '—' }}</span>
                  <span v-if="o.seller_rating != null" class="offers-list__seller-rating">★ {{ formatRating(o.seller_rating) }}</span>
                </div>
              </li>
            </ul>
            <p v-else class="product-details__empty">No offers.</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const product = ref<{
  id: string;
  name: string;
  image_url: string | null;
  attributes?: { key: string; value: string }[];
  offers?: {
    id: string;
    seller_id: string;
    seller_name?: string | null;
    seller_rating?: number | null;
    price_amount: number;
    price_currency: string;
    delivery_date: string | null;
  }[];
} | null>(null);
const offersSort = ref<'price' | 'delivery_date'>('price');
const isLoading = ref(true);
const error = ref<string | null>(null);
const imageLoadError = ref(false);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const imageUrl = computed(() => {
  if (!product.value) return null;
  const id = route.params.id as string;
  return `${apiBaseUrl}/v1/public/products/${id}/image`;
});
const showImage = computed(
  () =>
    !!product.value?.image_url &&
    !!imageUrl.value &&
    !imageLoadError.value
);

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
function formatRating(r: number) {
  return r.toFixed(1);
}
async function loadProduct(sort: 'price' | 'delivery_date' = 'price') {
  const id = route.params.id as string;
  try {
    const res = await axios.get(`${apiBaseUrl}/v1/public/products/${id}`, {
      params: { offers_sort: sort },
    });
    product.value = res.data;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load product';
  } finally {
    isLoading.value = false;
  }
}
function setOffersSort(sort: 'price' | 'delivery_date') {
  if (offersSort.value === sort) return;
  offersSort.value = sort;
  isLoading.value = true;
  loadProduct(sort);
}

onMounted(async () => {
  imageLoadError.value = false;
  isLoading.value = true;
  await loadProduct(offersSort.value);
});
</script>

<style scoped>
.product-details {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 0 0.5rem;
  box-sizing: border-box;
}

.back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  word-break: break-word;
}
.back-link:hover {
  color: var(--color-accent);
}

.product-details__hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 0;
  border-radius: var(--radius-md);
  overflow: visible;
}
@media (max-width: 768px) {
  .product-details__hero {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
@media (max-width: 480px) {
  .product-details {
    padding: 0 0.25rem;
  }
}

.product-details__media {
  aspect-ratio: 1;
  background: var(--color-bg);
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius-md) 0 0 0;
}
@media (max-width: 768px) {
  .product-details__media {
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
}
.product-details__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.product-details__placeholder {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 100%);
  color: var(--color-text-muted);
}
.product-details__placeholder-icon {
  font-size: clamp(2rem, 10vw, 4rem);
  opacity: 0.5;
}
.product-details__placeholder-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.product-details__main {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
  overflow: visible;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
@media (max-width: 768px) {
  .product-details__main {
    padding: 1rem;
  }
}
@media (max-width: 480px) {
  .product-details__main {
    padding: 0.75rem;
    gap: 1rem;
  }
}

.product-details__title {
  margin: 0 0 0.25rem;
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  line-height: 1.25;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.product-details__section {
  min-width: 0;
  overflow: visible;
}

.product-details__section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin: 0 0 0.5rem;
}

.product-details__empty {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}

.product-details__attrs {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  min-width: 0;
}
.product-details__attr {
  display: grid;
  grid-template-columns: minmax(0, 120px) minmax(0, 1fr);
  gap: 0.75rem;
  font-size: 0.9375rem;
  align-items: baseline;
  min-width: 0;
}
@media (max-width: 480px) {
  .product-details__attr {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
.product-details__attr dt {
  margin: 0;
  color: var(--color-text-muted);
  font-weight: 500;
  word-break: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
}
.product-details__attr dd {
  margin: 0;
  word-break: break-word;
  overflow-wrap: anywhere;
  min-width: 0;
  max-width: 100%;
}

.offers-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.offers-controls__label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.offers-controls__btn {
  padding: 0.35rem 0.75rem;
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
}
.offers-controls__btn:hover {
  background: var(--color-bg-hover);
}
.offers-controls__btn--active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.offers-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}
.offers-list__item {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-width: 0;
  overflow: visible;
}
.offers-list__main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.offers-list__seller {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}
.offers-list__seller-name {
  font-size: 0.875rem;
  color: var(--color-text);
}
.offers-list__seller-rating {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
@media (max-width: 480px) {
  .offers-list__item {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.625rem 0.75rem;
  }
}
.offers-list__price {
  font-weight: 600;
  color: var(--color-accent);
  word-break: break-word;
  overflow-wrap: anywhere;
  min-width: 0;
}
.offers-list__delivery {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  word-break: break-word;
  overflow-wrap: anywhere;
  min-width: 0;
}
</style>
