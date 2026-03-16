# Экспорт AI-сессии (Frontend) — пример 1

Файл для соответствия §8.1. Реальные экспорты сохранять как `session-YYYY-MM-DD.md` или `*.jsonl`.

---

## Сессия: детали продукта и Admin UI

**Задача:** Детали продукта — seller name/rating в офферах, сортировка Price/Delivery date (default price). Admin: CRUD продукта (форма + атрибуты + загрузка изображения), CRUD офферов (add/delete, загрузка изображения продукта).

**План:** Расширить тип оффера на фронте; добавить блок сортировки и запрос с offers_sort. Добавить маршруты /admin/products/new и /admin/products/:id/edit; форму продукта; на странице офферов — форму добавления оффера, кнопки удаления, блок загрузки изображения.

**Генерация (AI):** Правки ProductDetailsPage (computed showImage с учётом product.image_url); AdminProductFormPage (create/edit, attributes, image upload); правки AdminProductsPage (Add/Edit/Delete); правки AdminOffersPage (add offer, delete, upload image); маршруты в router.

**Проверка:** Ручной прогон: каталог → детали → сортировка; логин → список продуктов → создание/редактирование → офферы → загрузка изображения.

**Исправление:** Корректная передача authHeaders в multipart запросах; отображение productName на странице офферов.

**Итог:** Функционал соответствует критериям; итерация прошла цикл план → генерация → проверка → исправление.
