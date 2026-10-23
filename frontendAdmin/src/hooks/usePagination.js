import { useMemo, useState } from "react";

//controles para navegar (usado en Historial, Recompensas, Cupones).
export function usePagination(items = [], itemsPerPage = 4) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const currentItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, page, itemsPerPage]);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (n) => setPage(Math.min(Math.max(n, 1), totalPages));

  return { page, totalPages, currentItems, nextPage, prevPage, goToPage };
}
