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

			// Optional structured layout (rendered by CaseStudyStory.astro)
			// in place of a plain markdown body: quick facts, a timeline of
			// phases, highlight cards and a "What's next" list. Images are
			// optional; leave `img` out until there's a real one.
			story: z
				.object({
					eyebrow: z.string().optional(),
					// Large image under the intro. Separate from `img`, which is the
					// thumbnail on the work listing.
					heroImg: z.string().optional(),
					heroImg_alt: z.string().optional(),
					stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
					phasesHeading: z.string().optional(),
					phasesEyebrow: z.string().optional(),
					phases: z.array(
						z.object({
							label: z.string(),
							title: z.string(),
							body: z.string(),
							img: z.string().optional(),
							img_alt: z.string().optional(),
							current: z.boolean().optional(),
						})
					),
					highlightsHeading: z.string().optional(),
					highlights: z
						.array(
							z.object({
								title: z.string(),
								body: z.string(),
								// A built-in illustration instead of an image.
								visual: z.enum(['torque-chart']).optional(),
								img: z.string().optional(),
								img_alt: z.string().optional(),
							})
						)
						.optional(),
					next: z.array(z.string()).optional(),
				})
				.optional(),
		}),
	}),
};
