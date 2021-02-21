import unified from "unified";
import markdown from "remark-parse";
import html from "remark-html";
import prism from "remark-prism";
import slug from "remark-slug";
import externalLinks from "remark-external-links";

const markdownToHtml = async (content: string) => {
	const result = await unified()
		.use(externalLinks, { target: "_blank", rel: ["noopener"] })
		.use(markdown)
		.use(slug)
		.use(html)
		.use(prism, { transformInlineCode: true })
		.process(content);
	return result.toString();
};

export default markdownToHtml;
