import { Link } from "react-router-dom";
import { routePaths } from "@/app/router/routePaths";

export function NotFoundPage() {
  return (
    <section>
      <h1>Страница не найдена</h1>
      <p>Такого раздела marketplace не существует.</p>
      <Link to={routePaths.catalog}>Вернуться в каталог</Link>
    </section>
  );
}
