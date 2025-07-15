// improvements to the existing code highlighting

import dmpModule from "./diff_match_patch_uncompressed.js";


function init() {
	const views = [];
	const idMap = {};

	const elements = document.getElementsByClassName("codeview");
	if (elements.length === 0)
		return;

	var dmp = new dmpModule.diff_match_patch();

	[...elements].forEach(/** @type {Element} */ view => {

		const params = JSON.parse(view.querySelector("script#params").innerHTML);
		const raw = decodeHtmlEntity(view.querySelector("script#code").innerHTML);

		// copy button
		const copyButton = view.getElementsByClassName("copy-button")[0];
		copyButton.addEventListener("click", () => {
			copyTextToClipboard(raw);
		});

		const codeElement = view.querySelector("code");
		const lineElements = [...codeElement.children];

		const data = {
			element: view,
			params,
			raw,
			copyButton,
			lineElements
		};

		views.push(data);
		if (params?.id) {
			idMap[params?.id] = data;
		}
	});

	function diff_lineMode(text1, text2) {
		var a = dmp.diff_linesToChars_(text1, text2);
		var lineText1 = a.chars1;
		var lineText2 = a.chars2;
		var lineArray = a.lineArray;
		var diffs = dmp.diff_main(lineText1, lineText2, false);
		dmp.diff_charsToLines_(diffs, lineArray);
		return diffs;
	}
	
	views.forEach(view => {
		if (!view.params.diff || !idMap[view.params.diff]) {
			return;
		}
		view.diff = diff_lineMode(idMap[view.params.diff].raw, view.raw);
		console.log(view.diff);

		// var curSpan = 0;
		// for (var i = 0; i < view.diff.length && curSpan < view.lineElements.length; i++) {
		// 	const span = view.lineElements[curSpan];
		// 	console.log(span.innerHTML)

		// }
	});

	function collapseDiff(view) {
		if (!view.diff)
			return;
		console.log(view);

		const windowLines = 1;

		view.lineElements.forEach((e, i) => {
			var diffLine = view.diff[i];

			// e.style.display = "none";

		});
	}

	views.forEach(view => {
		if (view.diff) {
			collapseDiff(view);
		}
	});
}

module.exports = { init };

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(function () {
		console.log('Async: Copying to clipboard was successful!');
	}, function (err) {
		console.error('Async: Could not copy text: ', err);
	});
}

const decodeHtmlEntity = function (str) {
	return str.replace(/&#(\d+);/g, function (match, dec) {
		return String.fromCharCode(dec);
	});
};
