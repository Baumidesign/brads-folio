// Draft-copy markers used in case-study Markdown and frontmatter:
//   [VERIFY]            claim still to be confirmed against the codebase
//   [VERIFY: note]      same, with a note
//   [ALL CAPS …]        copy still to be written (e.g. [TIMEFRAME, e.g. 2023–present])
// The markers stay in the source. In dev they render as visible TODO / Verify
// badges; in production they are left untouched (draft pages aren't built).

const VERIFY = /\[VERIFY(?::\s*([^\]]+))?\]/g;
const TODO = /\[([A-Z][A-Z-]+\b[^\]]*)\]/g;
const ANY = /\[VERIFY(?::\s*[^\]]+)?\]|\[[A-Z][A-Z-]+\b[^\]]*\]/g;

const escape = (s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function markerToHtml(marker) {
	VERIFY.lastIndex = 0;
	const v = VERIFY.exec(marker);
	if (v) {
		return v[1]
			? `<mark class="draft-verify">Verify</mark> <mark class="draft-todo">${escape(v[1])}</mark>`
			: `<mark class="draft-verify">Verify</mark>`;
	}
	TODO.lastIndex = 0;
	const t = TODO.exec(marker);
	return `<mark class="draft-todo">TODO: ${escape(t ? t[1] : marker)}</mark>`;
}

/** Plain string → HTML with markers highlighted (for frontmatter values). */
export function highlightPlaceholders(text) {
	let out = '';
	let last = 0;
	for (const m of text.matchAll(ANY)) {
		out += escape(text.slice(last, m.index)) + markerToHtml(m[0]);
		last = m.index + m[0].length;
	}
	return out + escape(text.slice(last));
}

/** Remark plugin: highlight markers in Markdown text (dev only). */
export function remarkPlaceholders({ enabled = false } = {}) {
	return (tree) => {
		if (!enabled) return;
		const walk = (node) => {
			if (!node.children) return;
			const next = [];
			for (const child of node.children) {
				if (child.type === 'text' && ANY.test(child.value)) {
					ANY.lastIndex = 0;
					let last = 0;
					for (const m of child.value.matchAll(ANY)) {
						if (m.index > last) next.push({ type: 'text', value: child.value.slice(last, m.index) });
						next.push({ type: 'html', value: markerToHtml(m[0]) });
						last = m.index + m[0].length;
					}
					if (last < child.value.length) next.push({ type: 'text', value: child.value.slice(last) });
				} else {
					walk(child);
					next.push(child);
				}
				ANY.lastIndex = 0;
			}
			node.children = next;
		};
		walk(tree);
	};
}
