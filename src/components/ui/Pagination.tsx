import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  search?: string;
}

export default function Pagination({ currentPage, totalPages, basePath, search }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (search) params.set("search", search);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const linkClass = "rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand-600 hover:text-brand-600";

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link href={pageUrl(currentPage - 1)} className={linkClass}>
          Previous
        </Link>
      )}

      {pages.map((page) =>
        page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white"
          >
            {page}
          </span>
        ) : (
          <Link key={page} href={pageUrl(page)} className={linkClass}>
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link href={pageUrl(currentPage + 1)} className={linkClass}>
          Next
        </Link>
      )}
    </nav>
  );
}
