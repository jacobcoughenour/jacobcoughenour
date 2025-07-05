import { init as initToc } from "./toc";
import { init as initCodeViews } from "./codeview";

document.addEventListener("DOMContentLoaded", () => {
	initToc();
	initCodeViews();
});
