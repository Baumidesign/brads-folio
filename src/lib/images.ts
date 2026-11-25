/**
 * Responsive WebP variants for images in /public/assets.
 *
 * The originals stay in place (og:image previews use them, and some social
 * platforms handle WebP poorly). For each source listed here, `<name>-640.webp`
 * and `<name>-1280.webp` exist next to it in public/assets — generate both when
 * adding an entry. Anything not listed is served as-is.
 */
const HAS_VARIANTS = new Set([
	'/assets/atlanticletting.jpg',
	'/assets/calibration.jpg',
	'/assets/charnwoodsa.jpg',
	'/assets/case-study-worksheet.webp',
]);

export function responsiveImg(src: string): { src: string; srcset?: string } {
	if (!HAS_VARIANTS.has(src)) return { src };
	const base = src.replace(/\.[a-z]+$/i, '');
	return {
		src: `${base}-1280.webp`,
		srcset: `${base}-640.webp 640w, ${base}-1280.webp 1280w`,
	};
}
