# Blog

Personal blog built with Next.js App Router, Bun, Tailwind CSS, and a filesystem-based markdown content layer.

## Stack

- Next.js 15
- React 19
- Bun
- Tailwind CSS
- unified/remark/rehype for markdown rendering

## Development

```bash
bun install
bun run dev
```

## Content

Posts and writeups live in `content/`.

- `content/posts`
- `content/writeups`
- `content/about.mdx`

The homepage, listing pages, and article routes are statically generated.
RSS is served from `/rss.xml`.
