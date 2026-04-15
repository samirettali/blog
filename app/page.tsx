import Contacts from "../components/Contacts";
import { getConfig } from "../lib/config";
import { renderPageContent } from "../lib/content";

export default async function HomePage() {
  const [config, aboutHtml] = await Promise.all([getConfig(), renderPageContent("about.mdx")]);

  return (
    <div className="mx-auto mt-16 flex flex-col px-8">
      <div
        className="prose prose-slate prose-lg mx-auto max-w-none text-center leading-relaxed dark:prose-invert dark:prose-headings:text-slate-100 dark:prose-p:text-slate-100 dark:prose-li:text-slate-100 dark:prose-strong:text-white dark:prose-blockquote:text-slate-200 dark:prose-code:text-slate-100"
        dangerouslySetInnerHTML={{ __html: aboutHtml }}
      />
      {config.links?.length ? <Contacts className="mt-8" links={config.links} /> : null}
    </div>
  );
}
