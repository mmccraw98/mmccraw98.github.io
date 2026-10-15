import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  // Each project lives in its own folder: src/content/projects/<slug>/index.mdx
  loader: glob({ pattern: '*/index.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      links: z
        .array(z.object({ label: z.string(), href: z.string() }))
        .default([]),
    }),
});

export const collections = { projects };
