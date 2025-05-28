const mapping = Object.fromEntries([["#478cbf", "#478cbf"],
["#414042", "#414042"],
["#ffffff", "#414141"],
["#fff", "#414141"],
["#000000", "#bfbfbf"],
["#000", "#bfbfbf"],
["#ff0000", "#ff0000"],
["#00ff00", "#00ff00"],
["#0000ff", "#0000ff"],
["#e0e0e0", "#5a5a5a"],
["#fefefe", "#fefefe"],
["#808080", "#808080"],
["#b3b3b3", "#363636"],
["#699ce8", "#699ce8"],
["#f9f9f9", "#606060"],
["#c38ef1", "#a85de9"],
["#fc7f7f", "#cd3838"],
["#8da5f3", "#3d64dd"],
["#4b70ea", "#1a3eac"],
["#8eef97", "#2fa139"],
["#5fb2ff", "#0079f0"],
["#003e7a", "#2b74bb"],
["#f7f5cf", "#615f3a"],
["#ff4545", "#ff2929"],
["#ffe345", "#ffe337"],
["#80ff45", "#74ff34"],
["#45ffa2", "#2cff98"],
["#45d7ff", "#22ccff"],
["#8045ff", "#702aff"],
["#ff4596", "#ff2781"],
["#e1da5b", "#d6cf4b"],
["#62aeff", "#1678e0"],
["#75d1e6", "#41acc5"],
["#84ffee", "#49ccba"],
["#f70000", "#c91616"],
["#eec315", "#d58c0b"],
["#dbee15", "#b7d10a"],
["#288027", "#218309"],
["#ffca5f", "#fea900"],
["#2998ff", "#68b6ff"],
["#a2d2ff", "#4998e3"],
["#ea7940", "#bd5e2c"],
["#ff2b88", "#bd165f"],
["#eac840", "#bd9d1f"],
["#3cf34e", "#16a827"],
["#2877f6", "#236be6"],
["#eae440", "#9f9722"],
["#a448f0", "#9853ce"],
["#5ad5c4", "#0a9c88"],
["#d6d6d6", "#474747"],
["#474747", "#d6d6d6"],
["#919191", "#6e6e6e"],
["#fce00e", "#aa8d24"],
["#0e71fc", "#0350bd"],
["#c6ced4", "#828f9b"],
["#41ecad", "#25e3a0"],
["#6f91f0", "#6d8eeb"],
["#5abbef", "#4fb2e9"],
["#35d4f4", "#27ccf0"],
["#4593ec", "#4690e7"],
["#ac73f1", "#ad76ee"],
["#f1738f", "#ee758e"],
["#de66f0", "#dc6aed"],
["#b9ec41", "#96ce1a"],
["#f74949", "#f77070"],
["#ec418e", "#ec69a3"],
["#ee5677", "#ee7991"],
["#e1ec41", "#b2bb19"],
["#f68f45", "#f49047"],
["#417aec", "#6993ec"],
["#41ec80", "#2ce573"],
["#55f3e3", "#12d5c3"],
["#54ed9e", "#57e99f"],
["#77ce57", "#67c046"],
["#ea686c", "#d95256"],
["#eac968", "#d9b64f"],
	["#cf68ea", "#c050dd"]]);

const fs = require("fs");
const path = require("path");

function main() {

	var normalizedPath = path.join(__dirname, "static/godot_icons");

	fs.readdirSync(normalizedPath).forEach(function(file) {
		
		const filepath = path.join(normalizedPath, file);
		const newFilepath = path.join(__dirname, "static/godot_icons_light", file);

		const content = fs.readFileSync(filepath, {
			encoding: 'utf-8',
		});

		const matches = [];

		const ex = /"(#[0-9|a-f|A-F]{3,6})"/g;
		let m;
		while ((m = ex.exec(content)) !== null) {
			matches.push([ex.lastIndex, m[0].slice(1, m[0].length - 1)]);
		}

		let newString = content;

		if (!matches)
			return;

		console.log(newFilepath);
		console.log(matches);

		matches.reverse().forEach(e => {
			const mappedColor = mapping[e[1]];
			if (!mappedColor) {
				console.log("unmapped color:", e[1]);
				return;
			}
			newString = [newString.slice(0, e[0] - e[1].length - 1), mappedColor, newString.slice(e[0] - 1)].join("");
		});

		console.log(content);
		console.log(newString);

		fs.writeFileSync(newFilepath, newString, {
			encoding: "utf-8"
		});
	});
	
}


main();