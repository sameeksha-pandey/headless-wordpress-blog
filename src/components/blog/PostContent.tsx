interface PostContentProps {
  html: string;
}

// html is already sanitized in utils/wordpress.ts
export default function PostContent({ html }: PostContentProps) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-600 prose-a:underline-offset-2 hover:prose-a:text-brand-700 prose-blockquote:border-brand-600 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-pre:overflow-x-auto prose-pre:bg-slate-900 prose-img:rounded-xl prose-table:block prose-table:overflow-x-auto prose-th:bg-slate-100 prose-th:px-3 prose-td:px-3 prose-td:border prose-th:border prose-td:border-slate-200 prose-th:border-slate-200 lg:prose-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
