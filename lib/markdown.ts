import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkHtml from "remark-html";
import remarkSlug from "remark-slug";
import externalLinks from "remark-external-links";
import remarkHighlightjs from 'remark-highlight.js'


const markdownToHtml = async (content: string) => {
  const result = await unified()
    .use(externalLinks, { target: "_blank", rel: ["noopener"] })
    .use(remarkParse)
    .use(remarkHighlightjs)
    .use(remarkSlug)
    .use(remarkHtml)
    .process(content);
  return result.toString();
};

export default markdownToHtml;
