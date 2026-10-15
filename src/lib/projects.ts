import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** Folder name of the project, used as its URL slug. */
export const slugOf = (p: Project) => p.id.replace(/\/index$/, '');

export async function getProjects() {
  const all = await getCollection('projects', (p) => import.meta.env.DEV || !p.data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' });
