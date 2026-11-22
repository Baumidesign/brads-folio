// Rehype plugin: Markdown images load lazily so screenshots further down an
// article don't compete with the page's hero image for bandwidth.
// Covers ![]() images and raw <img> tags in Markdown (an explicit loading
// attribute is kept as written).
export function rehypeLazyImages() {
	const walk = (node) => {
		if (node.type === 'element' && node.tagName === 'img') {
			node.properties ??= {};
			node.properties.loading ??= 'lazy';
			node.properties.decoding ??= 'async';
		}
		node.children?.forEach(walk);
	};
	return (tree) => walk(tree);
}
