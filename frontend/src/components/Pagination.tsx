import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: 5 | 10;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: 5 | 10) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const hasPreviousPage = page > 1;
  const hasNextPage = totalPages > 0 && page < totalPages;

  return (
    <div className="pagination" aria-label="Paginação de missões">
      <div className="pagination-info">
        <span>{total} missões</span>
        <span>
          Página {totalPages === 0 ? 0 : page} de {totalPages}
        </span>
      </div>

      <div className="pagination-controls">
        <label htmlFor="page-size">Por página</label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value) as 5 | 10)}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>

        <button
          className="icon-button"
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          title="Página anterior"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          title="Próxima página"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

