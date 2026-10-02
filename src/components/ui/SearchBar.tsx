interface SearchBarProps {
  defaultValue?: string;
}

// Plain GET form so search works on the server without extra JavaScript
export default function SearchBar({ defaultValue }: SearchBarProps) {
  return (
    <form action="/blog" method="get" role="search" className="flex w-full max-w-md gap-2">
      <label htmlFor="search" className="sr-only">
        Search articles
      </label>
      <input
        id="search"
        name="search"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search articles..."
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Search
      </button>
    </form>
  );
}
