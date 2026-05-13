# Manual testing checklist

Этот checklist дополняет automated tests. Его удобно проходить перед demo, записью портфолио-видео или milestone approval.

## Catalog flow

- [ ] Открыть `/`.
- [ ] Проверить, что список товаров загружается.
- [ ] Проверить loading state при медленной загрузке mock API.
- [ ] Проверить, что товары отображают title, price и stock state.
- [ ] Проверить поиск по названию товара.
- [ ] Проверить фильтр товаров в наличии.
- [ ] Нажать "Добавить в корзину" у товара в наличии.
- [ ] Проверить, что счетчик корзины в Header увеличился.

## Cart flow

- [ ] Открыть `/cart` с пустой корзиной.
- [ ] Проверить empty state.
- [ ] Добавить товар из каталога и вернуться на `/cart`.
- [ ] Проверить, что item отображается с quantity и price.
- [ ] Нажать increase quantity.
- [ ] Нажать decrease quantity.
- [ ] Уменьшить quantity до нуля и проверить удаление item.
- [ ] Добавить несколько товаров и проверить subtotal.
- [ ] Нажать remove item.
- [ ] Нажать clear cart.
- [ ] Проверить, что subtotal обновляется после каждого действия.

## Account flow

- [ ] Открыть `/account`.
- [ ] Проверить loading state.
- [ ] Проверить profile section.
- [ ] Изменить name/email/phone и сохранить.
- [ ] Проверить validation error для пустого name.
- [ ] Проверить validation error для некорректной электронной почты.
- [ ] Проверить addresses section.
- [ ] Добавить новый address.
- [ ] Проверить, что add-address form очищается после успешного submit.
- [ ] Изменить существующий address.
- [ ] Удалить address.
- [ ] Проверить empty address state, если адресов не осталось.

## Checkout flow

- [ ] Открыть `/checkout` с непустой корзиной.
- [ ] Проверить cart summary.
- [ ] Проверить список saved addresses.
- [ ] Проверить delivery/payment placeholders.
- [ ] Проверить default payment method.
- [ ] Добавить optional comment.
- [ ] Нажать submit order.
- [ ] Проверить redirect на `/orders`.
- [ ] Проверить, что cart очищен только после successful order creation.

## Orders flow

- [ ] Открыть `/orders`.
- [ ] Проверить loading state.
- [ ] Проверить список initial mock orders.
- [ ] Создать новый order через checkout.
- [ ] Проверить, что новый order появился сверху списка.
- [ ] Проверить, что status отображается русским label, а internal value не показывается пользователю.
- [ ] Проверить, что отображается `subtotalPreview`, а не final total.

## Order persistence after reload

- [ ] Создать order через checkout.
- [ ] Перейти на `/orders`.
- [ ] Обновить страницу браузера.
- [ ] Проверить, что созданный order остался в списке.
- [ ] Открыть DevTools -> Application -> localStorage.
- [ ] Проверить ключ `marketplace-shell:orders:v1`.

## Corrupted localStorage checks

- [ ] В DevTools записать в `marketplace-shell:cart:v1` значение `{broken json`.
- [ ] Обновить страницу.
- [ ] Проверить, что app не падает, cart fallback становится пустым.
- [ ] В DevTools записать в `marketplace-shell:orders:v1` значение `{broken json`.
- [ ] Обновить `/orders`.
- [ ] Проверить, что app не падает и показывает initial mock orders.

## Empty cart checkout guard

- [ ] Очистить cart.
- [ ] Открыть `/checkout` напрямую.
- [ ] Проверить redirect на `/cart`.
- [ ] Проверить, что order не создается.

## Validation errors

- [ ] На `/account` отправить profile form с пустым name.
- [ ] На `/account` отправить profile form с некорректной электронной почтой.
- [ ] На `/account` отправить address form с пустыми required fields.
- [ ] На `/checkout` попробовать submit без address.
- [ ] На `/checkout` проверить, что unknown payment method не проходит schema validation в tests.

## Demo reset

- [ ] Очистить `marketplace-shell:cart:v1`.
- [ ] Очистить `marketplace-shell:orders:v1`.
- [ ] Обновить страницу.
- [ ] Проверить, что cart пустой, а orders вернулись к initial mock orders.
