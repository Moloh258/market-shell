# ADR: frontend subtotal preview-only

## Status

Accepted

## Context

Cart и checkout показывают subtotal, рассчитанный на frontend из current cart items. Эти данные могут быть изменены пользователем в client state или `localStorage`.

## Decision

Считать frontend subtotal только UI preview. В order model использовать `subtotalPreview`, а не authoritative `total`.

## Consequences

- UI может показывать приблизительную сумму.
- Checkout docs явно предупреждают, что backend должен пересчитать final total.
- `Order.total` не используется, чтобы не создавать ложное ощущение authoritative value.

## Limitations

- Нет taxes, shipping, discounts и final payment amount.
- Production backend должен проверять prices, stock, product availability, ownership, shipping и final total.
