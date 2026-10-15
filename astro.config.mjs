import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://mmccraw98.github.io',
  integrations: [mdx(), preact()],
  markdown: {
    // remark-math + KaTeX: write $inline$ and $$display$$ LaTeX in any .md/.mdx file.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: false }]],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
