export function init() {
	const article = document.querySelector("article#article-root");
	if (!article)
		// no article
		return;
	const toc = document.querySelector(".toc-root");
	const tocAnchors = toc.querySelectorAll("a");
	const articleHeaders = article.querySelectorAll("h1, h2, h3, h4, h5, h6");
	const commentsWindow = document.querySelector("#comments");

	function scroll() {
		const offsets = [...articleHeaders, commentsWindow]
			.filter(e => !!e)
			.map(e => [e.id, e.getBoundingClientRect().top])
			.sort(e => e[1] - e[0]);
		var i = offsets.findIndex(e => e[1] - 160 > 0);
		if (i === -1)
			i = offsets.length;
		i = Math.max(0, i - 1);
		const activeFragment = offsets[i][0];
		tocAnchors.forEach(e => {
			const fragmentIndex = e.href.indexOf("#");
			const fragment = e.href.slice(fragmentIndex + 1);
			const isActive = fragment === activeFragment;
			if (isActive) {
				!e.classList.contains("active") && e.classList.add("active");
			} else {
				e.classList.remove("active");
			}
		})
	}
	window.onscroll = scroll;
	scroll();
}
