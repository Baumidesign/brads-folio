import { getCollection } from 'astro:content';

// Drafts are built in dev, or in a preview build run with SHOW_DRAFTS=true
// (e.g. `SHOW_DRAFTS=true netlify deploy --build --alias blog-preview`) so a
// draft can be read on a phone before it's published. Never set on Netlify.
const showDrafts = import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true';

/** Published posts, newest first (plus drafts in dev and preview builds). */
export async function getPosts() {
	const posts = await getCollection('blog', (e) => showDrafts || !e.data.draft);
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
