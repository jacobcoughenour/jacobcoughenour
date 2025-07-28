import { init as initBackground } from "./animated_bg";
import { init as initToc } from "./toc";
import { init as initCodeViews } from "./codeview";
import { init as initShaderViews } from "./shaderview";

document.addEventListener("DOMContentLoaded", () => {
	initBackground();
	initToc();
	initCodeViews();
	initShaderViews();
});
