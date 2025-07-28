const utils = `
vec3 linear_srgb_to_oklab(vec3 c) {
	float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
	float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
	float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
	float l_ = pow(l, 1.0 / 3.0);
	float m_ = pow(m, 1.0 / 3.0);
	float s_ = pow(s, 1.0 / 3.0);
	return vec3(
		0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
		1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
		0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
	);
}

// warning: returns unclamped rgb
vec3 oklab_to_linear_srgb(vec3 c) {
	float l_ = c.r + 0.3963377774 * c.g + 0.2158037573 * c.b;
	float m_ = c.r - 0.1055613458 * c.g - 0.0638541728 * c.b;
	float s_ = c.r - 0.0894841775 * c.g - 1.2914855480 * c.b;
	float l = l_ * l_ * l_;
	float m = m_ * m_ * m_;
	float s = s_ * s_ * s_;
	return vec3(
		+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
	);
}

float remap(float v, float from1, float to1, float from2, float to2) {
	return (v - from1) / (to1 - from1) * (to2 - from2) + from2;
}

vec3 remap3(vec3 v, vec3 from1, vec3 to1, vec3 from2, vec3 to2) {
	return (v - from1) / (to1 - from1) * (to2 - from2) + from2;
}

vec3 remap3s(vec3 v, float from1, float to1, float from2, float to2) {
	vec3 from1v = vec3(from1);
	vec3 from2v = vec3(from2);
	return (v - from1v) / (vec3(to1) - from1v) * (vec3(to2) - from2v) + from2v;
}

vec2 remap2s(vec2 v, float from1, float to1, float from2, float to2) {
	vec2 from1v = vec2(from1);
	vec2 from2v = vec2(from2);
	return (v - from1v) / (vec2(to1) - from1v) * (vec2(to2) - from2v) + from2v;
}

float clamp01(float a) {
	return clamp(a, 0.0, 1.0);
}`;

module.exports = { utils };
