import { getCollection } from 'astro:content';

/** Published posts, newest first. Drafts are included in dev only. */
export async function getPosts() {
	const posts = await getCollection('blog', (e) => import.meta.env.DEV || !e.data.draft);
	return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

/** e.g. "23 November 2026" */
export const formatDate = (d: Date) =>
	d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Closing call to action at the end of every post. */
export const blogCta = {
	lead: 'Running your lab on spreadsheets or ageing software?',
	body: 'I build calibration and compliance software that fits how your lab actually works.',
	label: 'Book a chat',
	href: 'mailto:hi@bradbaumi.com.au',
};
