import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { routePaths } from "@/app/router/routePaths";
import { clearCart } from "@/entities/cart/model/cartSlice";
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTotalQuantity,
} from "@/entities/cart/model/selectors";
import { createOrder } from "@/entities/order/api/orderApi";
import { getUserAddresses } from "@/entities/user/api/userApi";
import { getErrorMessage } from "@/shared/api/errors";
import { queryKeys } from "@/shared/api/queryKeys";
import { checkoutSchema, type CheckoutFormValues } from "../model/schemas";

export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cartItems = useAppSelector(selectCartItems);
  const subtotalPreview = useAppSelector(selectCartSubtotal);
  const totalQuantity = useAppSelector(selectCartTotalQuantity);

  const addressesQuery = useQuery({
    queryKey: queryKeys.userAddresses,
    queryFn: getUserAddresses,
  });
  const {
    data: addresses = [],
    error: addressesError,
    isError: isAddressesError,
    isLoading: isAddressesLoading,
    isSuccess: isAddressesSuccess,
  } = addressesQuery;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      addressId: "",
      paymentMethod: "card_on_delivery",
      comment: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      dispatch(clearCart());
      navigate(routePaths.orders);
    },
  });
  const {
    error: createOrderError,
    isError: isCreateOrderError,
    isPending: isCreateOrderPending,
  } = createOrderMutation;

  if (cartItems.length === 0) {
    return <Navigate to={routePaths.cart} replace />;
  }

  const hasAddresses = addresses.length > 0;

  return (
    <section>
      <h1>Оформление заказа</h1>

      {isAddressesLoading ? <p>Загружаем оформление...</p> : null}

      {isAddressesError ? (
        <p role="alert">{getErrorMessage(addressesError)}</p>
      ) : null}

      {isAddressesSuccess ? (
        <form
          className="page-grid"
          onSubmit={handleSubmit((values) => {
            const payload = checkoutSchema.parse(values);
            const selectedAddress = addresses.find(
              (address) => address.id === payload.addressId,
            );

            if (!selectedAddress) {
              setError("addressId", {
                message: "Выберите корректный адрес доставки",
              });
              return;
            }

            createOrderMutation.mutate({
              items: cartItems,
              shippingAddress: selectedAddress,
              subtotalPreview,
              paymentMethod: payload.paymentMethod,
              comment: payload.comment,
            });
          })}
        >
          <section className="panel">
            <div className="section-heading">
              <h2>Состав заказа</h2>
              <p>
                Товаров: {totalQuantity}. Сумма на фронтенде только
                предварительная.
              </p>
            </div>
            <ul className="stack-list">
              {cartItems.map((item) => (
                <li key={item.productId}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      {item.price} ₽ x {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <strong>Предварительная сумма: {subtotalPreview} ₽</strong>
          </section>

          <section className="panel">
            <div className="section-heading">
              <h2>Адрес доставки</h2>
              <p>Выберите один из сохраненных адресов аккаунта.</p>
            </div>

            {!hasAddresses ? (
              <div className="empty-state">
                <p>Нет сохраненных адресов. Добавьте адрес перед оформлением.</p>
                <Link className="button-link" to={routePaths.account}>
                  Перейти в аккаунт
                </Link>
              </div>
            ) : (
              <div className="stack-list">
                {addresses.map((address) => (
                  <label className="choice-card" key={address.id}>
                    <input
                      type="radio"
                      value={address.id}
                      {...register("addressId")}
                    />
                    <span>
                      <strong>{address.fullName}</strong>
                      <span>
                        {address.street}, {address.city}, {address.country},{" "}
                        {address.postalCode}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {errors.addressId ? (
              <p role="alert">{errors.addressId.message}</p>
            ) : null}
          </section>

          <section className="panel">
            <div className="section-heading">
              <h2>Доставка и оплата</h2>
              <p>Реальные тарифы доставки и платежные провайдеры не подключены.</p>
            </div>
            <div className="summary-panel">
              <span>Стандартная доставка</span>
              <strong>Будет рассчитана позже</strong>
            </div>
            <div className="stack-list">
              <label className="choice-card">
                <input
                  type="radio"
                  value="card_on_delivery"
                  {...register("paymentMethod")}
                />
                <span>
                  <strong>Картой при получении</strong>
                  <span>Заглушка оплаты. Реальный платеж не проводится.</span>
                </span>
              </label>
              <label className="choice-card">
                <input
                  type="radio"
                  value="cash_on_delivery"
                  {...register("paymentMethod")}
                />
                <span>
                  <strong>Наличными при получении</strong>
                  <span>Заглушка оплаты. Реальный платеж не проводится.</span>
                </span>
              </label>
            </div>
            {errors.paymentMethod ? (
              <p role="alert">{errors.paymentMethod.message}</p>
            ) : null}

            <label className="field">
              Комментарий
              <textarea rows={4} {...register("comment")} />
              {errors.comment ? <span>{errors.comment.message}</span> : null}
            </label>

            <p className="muted">
              Финальные цены, наличие, права на адрес и стоимость доставки
              должен проверить backend при реальном оформлении.
            </p>

            {isCreateOrderError ? (
              <p role="alert">{getErrorMessage(createOrderError)}</p>
            ) : null}

            <button
              type="submit"
              disabled={!hasAddresses || isCreateOrderPending}
            >
              {isCreateOrderPending
                ? "Создаем заказ..."
                : "Создать заказ"}
            </button>
          </section>
        </form>
      ) : null}
    </section>
  );
}
