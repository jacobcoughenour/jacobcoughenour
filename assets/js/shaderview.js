import GUI from 'lil-gui';

function init() {
	const elements = document.getElementsByClassName("shaderview");
	if (elements.length === 0)
		return;
	[...elements].forEach(makeShaderView);
}

const decodeHtmlEntity = function (str) {
	return str.replace(/&#(\d+);/g, function (match, dec) {
		return String.fromCharCode(dec);
	});
};

module.exports = { init };

function makeShaderView(/** @type {HTMLElement} */ view) {

	const params = JSON.parse(view.querySelector("script#params").innerHTML);
	const rawCode = decodeHtmlEntity(view.querySelector("script#code").innerHTML);
	const canvas = view.querySelector("canvas#shaderview-canvas");

	const gui = new GUI({
		container: view
	});

	/** @type {WebGLRenderingContext} **/
	const gl = initWebGLCanvas(canvas);
	if (!gl)
		return;

	// todo allow way to override this
	const vertex = `
attribute vec4 a_vertexPos;
void main(void) {
	gl_Position = a_vertexPos;
}`;

	const fragment = `
precision mediump float;
uniform vec2 RESOLUTION;
uniform float TIME;
	${rawCode}`;

	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertex);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragment);
	const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);

	gl.clearColor(0, 0, 0, 0);

	const quadBuf = makeQuadBuffer(gl);

	const vertexPositions = gl.getAttribLocation(shaderProgram, "a_vertexPos");
	gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
	gl.vertexAttribPointer(vertexPositions, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPositions);

	const canvasSizeUniform = gl.getUniformLocation(shaderProgram, "RESOLUTION");
	const timeUniform = gl.getUniformLocation(shaderProgram, "TIME");

	const isDynamic = rawCode.indexOf("TIME") !== -1;

	const uniformValues = {};

	const uniformHints = Object.fromEntries(rawCode
		.split("\n")
		.filter(e => e.trim().startsWith("uniform "))
		.map(e => {
			const parts = e.split(" ").filter(e => e.trim().length > 0);
			const name = parts[2].replace(";", "");
			return [name, parseUniformHints(e)];
		}))
	
	const numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < numUniforms; i++) {
		const uniformInfo = gl.getActiveUniform(shaderProgram, i);
		if (uniformInfo.name === "TIME" || uniformInfo.name === "RESOLUTION")
			continue;

		console.log(uniformInfo);

		const hint = uniformHints[uniformInfo.name]

		// const type = glEnumToString(uniformInfo.type);
		
		if (uniformInfo.type === gl.FLOAT) {
			const value = hint?.["default"]?.[0] || 0;
			uniformValues[uniformInfo.name] = value;
			gui.add(uniformValues, uniformInfo.name);
		}
	}

	const start = Date.now();

	function draw(delta) {
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(shaderProgram);

		gl.uniform2fv(canvasSizeUniform, [gl.canvas.width, gl.canvas.height]);
		gl.uniform1f(timeUniform, ((start + performance.now()) % 10000000) * 0.001);

		// todo update dynamic uniforms

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		if (isDynamic)
			requestAnimationFrame(draw);
	}

	requestAnimationFrame(draw);
}

function initWebGLCanvas(/** @type {HTMLCanvasElement} **/ canvas) {
	try {
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		return gl;
	} catch (ex) {
		console.error("failed to create webgl context:", ex);
		return null;
	}
}

function parseUniformHints(/** @type {string} */ uniformLine) {
	const commentIndex = uniformLine.indexOf("//");
	if (commentIndex === -1)
		return {};
	const comment = uniformLine.slice(commentIndex + 2).trim();

	const parts = [];
	let part = "";
	let level = 0;
	for (let i = 0; i < comment.length; i++) {
		const c = comment[i];
		part += c;
		if (c === '(')
			level++;
		else if (c === ')')
			level--;
		if (c === " " && level === 0) {
			parts.push(part);
			part = "";
		}
	}
	if (part.length > 0)
		parts.push(part);

	const hints = {};
	parts.forEach(e => {
		const start = e.indexOf("(");
		const end = e.indexOf(")");
		if (start === -1 || end === -1)
			hints[type] = [];
		const type = e.slice(0, start).trim();
		const params = e
			.slice(start + 1, end)
			.split(",")
			.map(p => p.trim())
			.filter(p => p.length > 0)
			.map(p => JSON.parse(p))
		hints[type] = params;
	});
	return hints;
}

function loadShader(/** @type {WebGLRenderingContext} **/ gl, /** @type {GLenum} **/ type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("failed to compile shader:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createShaderProgram(/** @type {WebGLRenderingContext} **/ gl, vertexShader, fragmentShader) {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("failed to create shader program:", gl.getProgramInfoLog(program));
		return null;
	}
	return program;
}

function makeQuadBuffer(/** @type {WebGLRenderingContext} **/ gl) {
	const verts = new Float32Array([
		1.0, 1.0,
		-1.0, 1.0,
		-1.0, -1.0,
		-1.0, -1.0,
		1.0, -1.0,
		1.0, 1.0
	]);
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	return buf;
}

function glEnumToString(gl, value) {
	const keys = [];
	for (const key in gl) {
		if (gl[key] === value) {
			keys.push(key);
		}
	}
	return keys.length ? keys.join(' | ') : `0x${value.toString(16)}`;
}