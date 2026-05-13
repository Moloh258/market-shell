import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/entities/order/api/orderApi";
import type { OrderStatus } from "@/entities/order/model/types";
import { getErrorMessage } from "@/shared/api/errors";
import { queryKeys } from "@/shared/api/queryKeys";

const orderStatusLabels: Record<OrderStatus, string> = {
  new: "Новый",
  paid: "Оплачен",
  shipped: "Отправлен",
  done: "Завершен",
};

function getOrderStatusLabel(status: OrderStatus): string {
  return orderStatusLabels[status];
}

export function OrdersPage() {
  const ordersQuery = useQuery({
    queryKey: queryKeys.orders,
    queryFn: getOrders,
  });

  return (
    <section>
      <h1>Заказы</h1>

      {ordersQuery.isLoading ? <p>Загружаем заказы...</p> : null}

      {ordersQuery.isError ? (
        <p role="alert">{getErrorMessage(ordersQuery.error)}</p>
      ) : null}

      {ordersQuery.isSuccess && ordersQuery.data.length === 0 ? (
        <p>У вас пока нет заказов.</p>
      ) : null}

      {ordersQuery.data && ordersQuery.data.length > 0 ? (
        <ul className="item-list">
          {ordersQuery.data.map((order) => (
            <li key={order.id}>
              <div>
                <strong>{order.id}</strong>
                <div>
                  Статус: {getOrderStatusLabel(order.status)} - сумма:{" "}
                  {order.subtotalPreview} ₽ - товаров: {order.itemsCount}
                </div>
                <p className="muted">
                  Создан {new Date(order.createdAt).toLocaleString()} для{" "}
                  {order.shippingAddress.city}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
