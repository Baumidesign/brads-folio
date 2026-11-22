// schema.org structured data shared across pages. Only facts already stated
// on the site; keep it in step with the visible copy.
const SITE = 'https://bradbaumi.com.au';

export const person = {
	'@type': 'Person',
	'@id': `${SITE}/#person`,
	name: 'Bradley Baumann',
	url: `${SITE}/`,
	image: `${SITE}/assets/avatar.webp`,
	jobTitle: 'Full-Stack Developer',
	email: 'mailto:hi@bradbaumi.com.au',
	address: {
		'@type': 'PostalAddress',
		addressLocality: 'Adelaide',
		addressRegion: 'SA',
		addressCountry: 'AU',
	},
	knowsAbout: ['Calibration management software', 'Compliance management systems', 'Web development'],
	sameAs: ['https://www.linkedin.com/in/bradley-baumann-7069b231/'],
};

export const website = {
	'@type': 'WebSite',
	'@id': `${SITE}/#website`,
	url: `${SITE}/`,
	name: 'Bradley Baumann',
	inLanguage: 'en-AU',
	publisher: { '@id': person['@id'] },
};

export const graph = (...nodes: Record<string, unknown>[]) => ({
	'@context': 'https://schema.org',
	'@graph': nodes,
});

export const absUrl = (path: string) => new URL(path, SITE).toString();
