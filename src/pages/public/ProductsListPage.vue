<template>
  <div class="products-page">
    <h1 class="page-title">Products</h1>

    <div v-if="hasError" class="error-message">Error loading products. Try again later.</div>

    <div class="products-grid">
      <router-link
        v-for="product in products"
        :key="product.id"
        :to="`/products/${product.id}`"
        class="product-card card"
      >
        <div class="product-card__image-wrap">
          <img
            v-if="product.hasImage && !imageFailed[product.id]"
            :src="product.imageUrl!"
            :alt="product.name"
            class="product-card__image"
            @error="markImageFailed(product.id)"
          />
          <div v-else class="product-card__placeholder">
            <span class="product-card__placeholder-icon">◇</span>
            <span class="product-card__placeholder-text">Product photo</span>
          </div>
        </div>
        <div class="product-card__body">
          <h2 class="product-card__name">{{ product.name }}</h2>
          <p class="product-card__price">
            <template v-if="product.price != null">{{ formatPrice(product.price) }}</template>
            <template v-else>—</template>
          </p>
          <div class="product-card__meta">
            <span class="badge">Stock {{ product.stock }}</span>
            <span v-if="product.nearestDeliveryDate" class="product-card__delivery">
              Delivery {{ formatDate(product.nearestDeliveryDate) }}
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <div ref="sentinel" class="scroll-sentinel" aria-hidden="true" />
    <div v-if="isLoading" class="loading-spinner" role="status" aria-label="Loading" />
    <p v-else-if="!hasMore && products.length > 0" class="products-page__end">You’ve seen everything.</p>
    <p v-else-if="!hasError && products.length === 0 && !isLoading" class="products-page__empty">
      No products yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import axios from 'axios';

interface ProductListItem {
  id: string;
  name: string;
  thumbnail_url: string | null;
  price: number | null;
  stock: number;
  nearest_delivery_date: string | null;
}

interface ProductViewModel {
  id: string;
  name: string;
  imageUrl: string | null;
  hasImage: boolean;
  price: number | null;
  stock: number;
  nearestDeliveryDate: string | null;
}

const products = ref<ProductViewModel[]>([]);
const limit = 20;
const offset = ref(0);
const isLoading = ref(false);
const hasMore = ref(true);
const hasError = ref(false);
const sentinel = ref<HTMLElement | null>(null);
const imageFailed = ref<Record<string, boolean>>({});
let observer: IntersectionObserver | null = null;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function markImageFailed(id: string) {
  imageFailed.value[id] = true;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}
function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

async function loadMore() {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await axios.get<{ items: ProductListItem[] }>(
      `${apiBaseUrl}/v1/public/products`,
      {
        params: {
          limit,
          offset: offset.value,
        },
      },
    );

    const items = response.data.items || [];

    const mapped: ProductViewModel[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: `${apiBaseUrl}/v1/public/products/${item.id}/image`,
      hasImage: !!item.thumbnail_url,
      price: item.price,
      stock: item.stock,
      nearestDeliveryDate: item.nearest_delivery_date,
    }));

    products.value.push(...mapped);
    offset.value += items.length;

    if (items.length < limit) {
      hasMore.value = false;
    }
  } catch (e) {
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadMore();

  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      void loadMore();
    }
  });

  if (sentinel.value) {
    observer.observe(sentinel.value);
  }
});

onBeforeUnmount(() => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value);
  }
});
</script>

<style scoped>
.products-page {
  width: 100%;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.product-card {
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  color: inherit;
}
.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.product-card__image-wrap {
  aspect-ratio: 1;
  background: var(--color-bg);
  overflow: hidden;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 100%);
  color: var(--color-text-muted);
}
.product-card__placeholder-icon {
  font-size: 2.5rem;
  opacity: 0.5;
}
.product-card__placeholder-text {
  font-size: 0.75rem;
  font-weight: 500;
}

.product-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-card__name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-accent);
  margin: 0;
}

.product-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}
.product-card__delivery {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.scroll-sentinel {
  height: 1px;
  pointer-events: none;
}

.products-page__end,
.products-page__empty {
  text-align: center;
  color: var(--color-text-muted);
  margin: 2rem 0;
  font-size: 0.9375rem;
}
</style>
