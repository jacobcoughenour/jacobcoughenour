import { utils } from "./shaderutils";

const vertex = `
attribute vec4 a_vertexPos;
void main(void) {
	gl_Position = a_vertexPos;
}`;
const fragment = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_scroll;
uniform vec3 u_bgColorRgb;
uniform float u_time;

${utils}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
	vec3 Pi0 = floor(P); // Integer part for indexing
	vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
	Pi0 = mod(Pi0, 289.0);
	Pi1 = mod(Pi1, 289.0);
	vec3 Pf0 = fract(P); // Fractional part for interpolation
	vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
	vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
	vec4 iy = vec4(Pi0.yy, Pi1.yy);
	vec4 iz0 = Pi0.zzzz;
	vec4 iz1 = Pi1.zzzz;

	vec4 ixy = permute(permute(ix) + iy);
	vec4 ixy0 = permute(ixy + iz0);
	vec4 ixy1 = permute(ixy + iz1);

	vec4 gx0 = ixy0 / 7.0;
	vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
	gx0 = fract(gx0);
	vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
	vec4 sz0 = step(gz0, vec4(0.0));
	gx0 -= sz0 * (step(0.0, gx0) - 0.5);
	gy0 -= sz0 * (step(0.0, gy0) - 0.5);

	vec4 gx1 = ixy1 / 7.0;
	vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
	gx1 = fract(gx1);
	vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
	vec4 sz1 = step(gz1, vec4(0.0));
	gx1 -= sz1 * (step(0.0, gx1) - 0.5);
	gy1 -= sz1 * (step(0.0, gy1) - 0.5);

	vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
	vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
	vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
	vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
	vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
	vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
	vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
	vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

	vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	g000 *= norm0.x;
	g010 *= norm0.y;
	g100 *= norm0.z;
	g110 *= norm0.w;
	vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
	g001 *= norm1.x;
	g011 *= norm1.y;
	g101 *= norm1.z;
	g111 *= norm1.w;

	float n000 = dot(g000, Pf0);
	float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
	float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
	float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
	float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
	float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
	float n111 = dot(g111, Pf1);

	vec3 fade_xyz = fade(Pf0);
	vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
	return 2.2 * n_xyz;
}

float dither8(vec2 position, float brightness) {
	int x = int(mod(position.x, 8.0));
	int y = int(mod(position.y, 8.0));
	int index = x + y * 8;
	float limit = 0.0;

	if (x < 8) {
		if (index == 0) limit = 0.015625;
		if (index == 1) limit = 0.515625;
		if (index == 2) limit = 0.140625;
		if (index == 3) limit = 0.640625;
		if (index == 4) limit = 0.046875;
		if (index == 5) limit = 0.546875;
		if (index == 6) limit = 0.171875;
		if (index == 7) limit = 0.671875;
		if (index == 8) limit = 0.765625;
		if (index == 9) limit = 0.265625;
		if (index == 10) limit = 0.890625;
		if (index == 11) limit = 0.390625;
		if (index == 12) limit = 0.796875;
		if (index == 13) limit = 0.296875;
		if (index == 14) limit = 0.921875;
		if (index == 15) limit = 0.421875;
		if (index == 16) limit = 0.203125;
		if (index == 17) limit = 0.703125;
		if (index == 18) limit = 0.078125;
		if (index == 19) limit = 0.578125;
		if (index == 20) limit = 0.234375;
		if (index == 21) limit = 0.734375;
		if (index == 22) limit = 0.109375;
		if (index == 23) limit = 0.609375;
		if (index == 24) limit = 0.953125;
		if (index == 25) limit = 0.453125;
		if (index == 26) limit = 0.828125;
		if (index == 27) limit = 0.328125;
		if (index == 28) limit = 0.984375;
		if (index == 29) limit = 0.484375;
		if (index == 30) limit = 0.859375;
		if (index == 31) limit = 0.359375;
		if (index == 32) limit = 0.0625;
		if (index == 33) limit = 0.5625;
		if (index == 34) limit = 0.1875;
		if (index == 35) limit = 0.6875;
		if (index == 36) limit = 0.03125;
		if (index == 37) limit = 0.53125;
		if (index == 38) limit = 0.15625;
		if (index == 39) limit = 0.65625;
		if (index == 40) limit = 0.8125;
		if (index == 41) limit = 0.3125;
		if (index == 42) limit = 0.9375;
		if (index == 43) limit = 0.4375;
		if (index == 44) limit = 0.78125;
		if (index == 45) limit = 0.28125;
		if (index == 46) limit = 0.90625;
		if (index == 47) limit = 0.40625;
		if (index == 48) limit = 0.25;
		if (index == 49) limit = 0.75;
		if (index == 50) limit = 0.125;
		if (index == 51) limit = 0.625;
		if (index == 52) limit = 0.21875;
		if (index == 53) limit = 0.71875;
		if (index == 54) limit = 0.09375;
		if (index == 55) limit = 0.59375;
		if (index == 56) limit = 1.0;
		if (index == 57) limit = 0.5;
		if (index == 58) limit = 0.875;
		if (index == 59) limit = 0.375;
		if (index == 60) limit = 0.96875;
		if (index == 61) limit = 0.46875;
		if (index == 62) limit = 0.84375;
		if (index == 63) limit = 0.34375;
	}
	return brightness < limit ? 0.0 : 1.0;
}

void main(void) {
	float res = 8.0;
	float noise_scale = 0.002;
	float speed = 0.1;
	float scroll_speed = 0.1;
	float noise_opacity = 0.05;

	vec2 pos = gl_FragCoord.xy;

	// this makes the noise actually snap to the pixels
	// pos = floor(pos / res) * res;

	pos.y += -u_scroll;
	pos *= noise_scale;
	pos.y += u_time * scroll_speed;

	vec3 bg_lab = linear_srgb_to_oklab(u_bgColorRgb);

	vec3 noise_layer = bg_lab;
	// apply noise to the L channel
	float noise = cnoise(vec3(pos, u_time * speed));
	// noise = mix(-1.0, 1.0, (noise + 1.0) * 0.5);
	noise_layer.r += noise;
	// dither the L channel
	noise_layer.r = dither8(gl_FragCoord.xy / res, noise_layer.r);

	vec3 bg_rgb = oklab_to_linear_srgb(mix(bg_lab, noise_layer, clamp(noise_layer.r * noise_opacity, 0.0, 1.0)));

	gl_FragColor = vec4(bg_rgb,1.0);
}`;

function initWebGLCanvas() {
	try {
		const canvas = document.getElementById("bg-canvas");
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		return gl;
	} catch (ex) {
		console.error("failed to create webgl context:", ex);
		return null;
	}
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

function init() {
	/** @type {WebGLRenderingContext} **/
	const gl = initWebGLCanvas();
	if (!gl)
		return;

	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertex);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragment);
	const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);

	gl.clearColor(0, 0, 0, 0);

	const quadBuf = makeQuadBuffer(gl);

	const vertexPositions = gl.getAttribLocation(shaderProgram, "a_vertexPos");
	gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
	gl.vertexAttribPointer(vertexPositions, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPositions);

	const canvasSizeUniform = gl.getUniformLocation(shaderProgram, "u_resolution");
	const scrollUniform = gl.getUniformLocation(shaderProgram, "u_scroll");
	const timeUniform = gl.getUniformLocation(shaderProgram, "u_time");
	const bgColorRgbUniform = gl.getUniformLocation(shaderProgram, "u_bgColorRgb");
	const parts = [0.17, 0.11, 0.22];

	const start = Date.now();

	function draw(delta) {
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = window.innerHeight;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(shaderProgram);

		gl.uniform2fv(canvasSizeUniform, [gl.canvas.width, gl.canvas.height]);
		gl.uniform1f(scrollUniform, -document.body.getBoundingClientRect().top)
		gl.uniform1f(timeUniform, ((start + performance.now() ) % 10000000) * 0.001);
		gl.uniform3fv(bgColorRgbUniform, parts);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		requestAnimationFrame(draw);
	}

	requestAnimationFrame(draw);
}

module.exports = { init };
