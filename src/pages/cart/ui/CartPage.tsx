import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Link } from "react-router-dom";
import { routePaths } from "@/app/router/routePaths";
import {
  clearCart,
  decreaseCartItemQuantity,
  increaseCartItemQuantity,
  removeCartItemById,
} from "@/entities/cart/model/cartSlice";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTotalQuantity,
} from "@/entities/cart/model/selectors";

export function CartPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);
  const isCartEmpty = cartItems.length === 0;

  return (
    <section>
      <h1>Корзина</h1>
      {isCartEmpty ? (
        <div className="empty-state">
          <p>Корзина пуста.</p>
          <button disabled>Оформление недоступно</button>
        </div>
      ) : (
        <>
          <ul className="item-list">
            {cartItems.map((item) => (
              <li key={item.productId}>
                <div>
                  <strong>{item.title}</strong>
                  <div>
                    {item.price} ₽ x {item.quantity}
                  </div>
                  <div>Сумма по позиции: {item.price * item.quantity} ₽</div>
                </div>
                <div className="button-row">
                  <button
                    aria-label={`Уменьшить количество для ${item.title}`}
                    onClick={() =>
                      dispatch(decreaseCartItemQuantity(item.productId))
                    }
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label={`Увеличить количество для ${item.title}`}
                    onClick={() =>
                      dispatch(increaseCartItemQuantity(item.productId))
                    }
                  >
                    +
                  </button>
                  <button
                    onClick={() => dispatch(removeCartItemById(item.productId))}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="summary-panel">
            <div>
              <strong>Предварительная сумма: {subtotal} ₽</strong>
              <p>Товаров: {totalQuantity}</p>
              <p className="muted">
                Эта сумма нужна только для интерфейса. Финальные цены должен
                пересчитать backend при оформлении заказа.
              </p>
            </div>
            <div className="button-row">
              <button onClick={() => dispatch(clearCart())}>
                Очистить корзину
              </button>
              <Link className="button-link" to={routePaths.checkout}>
                Оформить заказ
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
