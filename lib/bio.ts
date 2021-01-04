import fs from "fs";
import remark from "remark";
import path from "path";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export async function getBio(variant: 'short' | 'normal') {
  const filename = variant == 'short' ? 'short-bio.md' : 'bio.md'
  const aboutPath = path.join(contentDirectory, filename);
  const fileContents = fs.readFileSync(aboutPath, "utf8");
  const processedContent = await remark().use(html).process(fileContents);
  const contentHtml = processedContent.toString();
  return contentHtml;
}
