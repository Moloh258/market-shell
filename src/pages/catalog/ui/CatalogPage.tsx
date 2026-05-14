import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/app/hooks";
import { addProductToCart } from "@/entities/cart/model/cartSlice";
import type { AddCartItemPayload } from "@/entities/cart/model/types";
import { getProducts } from "@/entities/product/api/productApi";
import type { Product } from "@/entities/product/model/types";
import { getErrorMessage } from "@/shared/api/errors";
import { queryKeys } from "@/shared/api/queryKeys";

function toAddCartItemPayload(product: Product): AddCartItemPayload {
  return {
    productId: product.id,
    title: product.title,
    price: product.price,
    imageUrl: product.imageUrl,
  };
}

export function CatalogPage() {
  const dispatch = useAppDispatch();
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: getProducts,
  });
  const {
    data: productsData,
    error: productsError,
    isError: isProductsError,
    isLoading: isProductsLoading,
    isSuccess: isProductsSuccess,
  } = productsQuery;

  const filteredProducts = useMemo(() => {
    const products = productsData ?? [];

    return products.filter((product) => {
      const matchesQuery = product.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStock = showOnlyInStock ? product.inStock : true;

      return matchesQuery && matchesStock;
    });
  }, [productsData, query, showOnlyInStock]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <section>
      <h1>Каталог</h1>
      <div className="toolbar">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск товаров"
        />
        <label className="inline-control">
          <input
            type="checkbox"
            onChange={() => setShowOnlyInStock((prev) => !prev)}
            checked={showOnlyInStock}
          />
          Только в наличии
        </label>
      </div>

      {isProductsLoading ? <p>Загружаем товары...</p> : null}

      {isProductsError ? (
        <p role="alert">{getErrorMessage(productsError)}</p>
      ) : null}

      {isProductsSuccess && filteredProducts.length === 0 ? (
        <p>Товары не найдены.</p>
      ) : null}

      {filteredProducts.length > 0 ? (
        <ul className="item-list">
          {filteredProducts.map((product) => (
            <li key={product.id}>
              <div>
                <strong>{product.title}</strong>
                <div>{product.price} ₽</div>
              </div>
              <button
                disabled={!product.inStock}
                onClick={() =>
                  dispatch(addProductToCart(toAddCartItemPayload(product)))
                }
              >
                {product.inStock ? "Добавить в корзину" : "Нет в наличии"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
