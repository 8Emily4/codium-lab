import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Hand-styled markdown renderer (no typography plugin dependency).
 * Used to render lecture-material bodies.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 mb-4 text-2xl font-bold tracking-tight text-zinc-900 first:mt-0 dark:text-zinc-50">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 border-b border-zinc-200 pb-2 text-xl font-bold tracking-tight text-zinc-900 first:mt-0 dark:border-zinc-800 dark:text-zinc-50">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-4">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-1.5 pl-6 marker:text-zinc-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-1.5 pl-6 marker:text-zinc-400">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-indigo-300 bg-indigo-50/50 py-1 pl-4 text-zinc-600 italic dark:border-indigo-700 dark:bg-indigo-950/20 dark:text-zinc-300">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900 dark:text-zinc-50">
              {children}
            </strong>
          ),
          code: ({ className, children }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <code className={`${className ?? ""} block`}>{children}</code>
              );
            }
            return (
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[13px] text-fuchsia-600 dark:bg-zinc-800 dark:text-fuchsia-300">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-5 overflow-x-auto rounded-xl bg-zinc-900 p-4 font-mono text-[13px] leading-6 text-zinc-100 dark:bg-black dark:ring-1 dark:ring-zinc-800">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-zinc-200 bg-zinc-50 px-3 py-2 text-left font-semibold dark:border-zinc-800 dark:bg-zinc-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-zinc-200 px-3 py-2 dark:border-zinc-800">
              {children}
            </td>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={src}
                alt={alt ?? ""}
                className="my-5 rounded-xl border border-zinc-200 dark:border-zinc-800"
              />
            ) : null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
