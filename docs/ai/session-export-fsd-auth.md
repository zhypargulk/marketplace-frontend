# Экспорт AI-сессии (Frontend) — пример 2

Второй пример экспорта для понимания процесса (§8.1).

---

## Сессия: FSD и auth

**Задача:** Ввести слои Feature-Sliced Design (shared, entities, features, widgets) и единый источник правды для токена (useAuth), чтобы после логина UI обновлялся без перезагрузки.

**План:** Создать shared/config (apiBaseUrl), shared/api (axios); entities/product (типы ProductDetail, ProductOffer и т.д.); features/auth (useAuth: token, setToken, authHeaders); widgets/AppHeader (опционально). В AdminLoginPage после успешного логина вызывать setToken; в App.vue использовать useAuth().isAdmin для отображения бейджа и кнопки выхода.

**Генерация (AI):** Файлы в src/shared, src/entities, src/features, src/widgets; реализация useAuth с реактивным token; замена localStorage.setItem в AdminLoginPage на setToken; импорт apiBaseUrl из shared/config в нужных местах.

**Проверка:** Логин в Admin — сразу отображаются бейдж и «Log out» без перезагрузки; переход на защищённые страницы корректен.

**Исправление:** Общий ref для token на уровне модуля в features/auth, чтобы все компоненты видели одно состояние.

**Итог:** FSD-структура и централизованный auth позволяют управляемо расширять фронт; процесс понятен по экспорту сессии.
