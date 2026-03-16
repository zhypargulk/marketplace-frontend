# PROMPTS.md — наиболее важные промпты и правила (Frontend)

Опциональный, но приветствуемый артефакт §8.1. Примеры промптов и правила для последующих итераций.

---

## 1. Архитектура и FSD

- «Структура Vue 3 + TypeScript по Feature-Sliced Design: слои app, pages, widgets, features, entities, shared. app — layout и router; pages — экраны; entities — типы продукта/оффера; features — auth; shared — config и API client.»
- «Добавь в shared: config (apiBaseUrl из env), api (axios instance). В features/auth — useAuth (token, setToken, authHeaders). Использовать в App.vue и AdminLoginPage, чтобы после логина UI обновлялся без перезагрузки.»

---

## 2. Страницы и контракты

- «На странице деталей продукта показывать seller_name и seller_rating в каждом оффере; кнопки сортировки Price / Delivery date; по умолчанию запрос с offers_sort=price.»
- «В Admin: список продуктов с кнопками Add product, Edit, Delete. Страница создания/редактирования продукта: name, price, currency, stock, атрибуты (add/remove), загрузка изображения (только для edit). Отдельная страница офферов продукта: форма Add offer (seller, price, currency, delivery), удаление оффера, блок загрузки изображения продукта.»

---

## 3. UX и плейсхолдеры

- «Когда у продукта нет фото: показывать блок с текстом "Product photo" и иконкой. На детальной странице не запрашивать image endpoint, если API вернул image_url null. В списке использовать thumbnail_url из API и показывать плейсхолдер, если его нет.»

---

## 4. Правила для последующих итераций (копировать в промпты)

- Импорты между слоями FSD: pages могут использовать features, entities, shared; не импортировать из pages в entities/features/shared.
- Токен админа хранить в localStorage и синхронизировать через useAuth (setToken при логине), чтобы header и защищённые страницы реагировали без перезагрузки.
- Все запросы к API с авторизацией — заголовок Authorization: Bearer <token> из useAuth().authHeaders().
- При добавлении новых полей из API обновлять типы в entities и отображение в компонентах.
- Формы с multipart (загрузка файла) не перезаписывать Content-Type вручную — браузер выставит boundary; передавать только authHeaders и FormData.
