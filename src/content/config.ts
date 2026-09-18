import { defineCollection, z } from 'astro:content';

export const collections = {
	work: defineCollection({
		type: 'content',
		schema: z.object({
			title: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			img: z.string(),
			img_alt: z.string().optional(),

			// Functional description of the work done — deliberately not a job
			// title (e.g. "Designed and built the company's calibration-
			// management architecture from the ground up"). Rendered as a
			// muted attribution line, not styled like a role/title.
			role: z.string().optional(),

			// Tech-stack badges shown near the top of the case study.
			techStack: z.array(z.string()).optional(),

			// Drives which context banner (if any) the case-study template
			// auto-renders:
			// - 'owned-product': work the author designed, built, and owns
			// - 'client-site': freelance/agency client work, no special note
			// - 'employer-experience': experience/skills demonstrated on an
			//   employer-owned system — not an owned deliverable
			caseStudyType: z.enum(['owned-product', 'client-site', 'employer-experience']).optional(),

			// Structured live-site link, rendered as a "Visit live site" CTA
			// instead of a hand-written <a> buried in the markdown body.
			externalUrl: z.string().url().optional(),

			// Lets the homepage curate specific case studies later instead of
			// always showing the 4 most recent by publishDate.
			featured: z.boolean().optional(),
		}),
	}),
};
