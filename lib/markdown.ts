import unified from 'unified';
import markdown from 'remark-parse';
import html from "remark-html";
import prism from "remark-prism";
import slug from 'remark-slug';

const markdownToHtml = async (content: string) => {
  const result = await unified()
		.use(markdown)
		.use(slug)
		.use(html)
		.use(prism)
		.process(content)
	return result.toString();
}

export default markdownToHtml
