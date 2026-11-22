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

			// Draft entries are only built in dev (reachable by URL), never
			// listed on the homepage or Work page, and always noindexed.
			draft: z.boolean().optional(),
			noindex: z.boolean().optional(),

			// Optional <title> override; falls back to `title`.
			seoTitle: z.string().optional(),

			// Long-form layout (rendered by CaseStudyLongForm.astro): an intro
			// header with quick facts, then the Markdown body as the article,
			// then a closing CTA. `title` stays the short card name; `headline`
			// is the page's H1. Uses `role` and `techStack` ("Built with").
			longForm: z
				.object({
					eyebrow: z.string().optional(),
					headline: z.string(),
					// Intro paragraph under the H1; falls back to `description`
					// (which stays the meta description either way).
					lede: z.string().optional(),
					timeline: z.string().optional(),
					heroImg: z.string().optional(),
					heroImg_alt: z.string().optional(),
					cta: z
						.object({
							lead: z.string(),
							body: z.string(),
							label: z.string(),
							href: z.string().default('mailto:hi@bradbaumi.com.au'),
						})
						.optional(),
				})
				.optional(),

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
								// Span the full row of the highlights grid.
								wide: z.boolean().optional(),
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
