let filenames = [
	"timeout_0ms",
	"timeout_200ms",
	"timeout_400ms",
	"timeout_600ms",
	"timeout_800ms",
	"timeout_1000ms",
	"ww_off_1min",
	"ww_on_1min",
	"ww_off_5min",
	"ww_on_5min",
	"ww_off_10min",
	"ww_on_10min",
];
let TARGET_COMPONENT = "BaseComponent";

let calculateAverage = (data, filename) => {
	let measures = data.timelineData[0].componentMeasures;

	// Filter for render measures of the target component
	let renderMeasures = measures.filter(
		(m) => m.type === "render" && m.componentName === TARGET_COMPONENT
	);

	if (renderMeasures.length === 0) {
		console.log(`No render measures found for "${TARGET_COMPONENT}".`);
		process.exit(0);
	}

	let totalDuration = renderMeasures.reduce((sum, m) => sum + m.duration, 0);

	let average = totalDuration / renderMeasures.length;

	console.log(
		`(${filename})`,
		"average:",
		average.toFixed(2),
		"renders:",
		renderMeasures.length
	);
};

for (let filename of filenames) {
	let data = require(`./recorded_profiles/${filename}.json`);
	calculateAverage(data, filename);
}
