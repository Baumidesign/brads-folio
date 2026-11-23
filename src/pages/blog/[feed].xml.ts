// RSS feed at /blog/rss.xml. A dynamic route so it's only built once at
// least one post is published (no posts → no feed).
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../../lib/blog';

export const prerender = true;

export async function getStaticPaths() {
	const posts = (await getPosts()).filter((p) => !p.data.draft);
	return posts.length ? [{ params: { feed: 'rss' } }] : [];
}

export async function GET(context: APIContext) {
	const posts = (await getPosts()).filter((p) => !p.data.draft);
	return rss({
		title: 'Bradley Baumann: Blog',
		description: 'Notes on calibration software, ISO/IEC 17025 and moving labs off ageing systems.',
		site: context.site ?? 'https://bradbaumi.com.au',
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `/blog/${post.id}/`,
		})),
		customData: '<language>en-AU</language>',
	});
}
