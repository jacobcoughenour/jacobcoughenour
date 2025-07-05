// improvements to the existing code highlighting

function init() {
	const views = [];
	const idMap = {};

	const elements = document.getElementsByClassName("codeview");
	[...views].forEach(/** @type {Element} */ view => {

		const params = JSON.parse(view.querySelector("script#params").innerHTML);
		const raw = decodeHtmlEntity(view.querySelector("script#code").innerHTML);

		// const view = {
		// 	element: view,
		// 	params,
		// 	raw,
		// }

		views.push(view);

		// // copy button
		// const copy_button = view.getElementsByClassName("copy-button")[0];
		// copy_button.addEventListener("click", () => {
		// 	console.log("click");

		// 	copyTextToClipboard(content);


		// });
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
