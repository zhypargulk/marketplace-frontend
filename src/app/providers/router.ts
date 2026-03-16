import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'PublicProducts',
    component: () => import('../../pages/public/ProductsListPage.vue'),
  },
  {
    path: '/products/:id',
    name: 'PublicProductDetails',
    component: () => import('../../pages/public/ProductDetailsPage.vue'),
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../../pages/admin/AdminLoginPage.vue'),
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: () => import('../../pages/admin/AdminProductsPage.vue'),
  },
  {
    path: '/admin/products/new',
    name: 'AdminProductNew',
    component: () => import('../../pages/admin/AdminProductFormPage.vue'),
  },
  {
    path: '/admin/products/:id/edit',
    name: 'AdminProductEdit',
    component: () => import('../../pages/admin/AdminProductFormPage.vue'),
  },
  {
    path: '/admin/products/:id/offers',
    name: 'AdminOffers',
    component: () => import('../../pages/admin/AdminOffersPage.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

