// This is an example dd-Component that can be used as a basis for building custom dd-Components.
// It consists of:
// - acceptedDataTypes Array of Data Types the dd-Component advertises as accepted
// - componentInformation String that provides a very brief one-liner about the dd-Component's functionality
// - componentExplanation String or Element, going into much more detail about how the dd-Component works and whether or not special settings are available
// - componentName String that represents how the dd-Component is referred to in the Interface
// - componentIcon SVG that represents the dd-Component in the Interface
// - dataValidator Function that takes in data and spits out an array of all incompatible Sources
// - dataProcessor Function that takes in data and slotSettings and gives the data back in a format that renderComponent can use (optional)
// - renderComponent Function that takes in the encompassing Slot's uuid and slotSettings, as well as any data passed to it

// The return bundle also provides the following options:
// - customSettingsPane: Defining a custom Settings pane. Should none be defined, enter a falsy value or remove the key
// - settingsMapper: Defining a custom Function that will be able to generate an Array of Keys that the Default Settings Pane can use. (omittable like customSettingsPane)
// - generalSettings: Defining keys for general settings, which will be used should no customSettingsPane be defined
// - bypassEmpty: A boolean that allows dd-Component to be displayed without Sources

// dd-Components can also import things from libraries that are imported in the project
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

// region Component Information

const componentName = "Line Chart";

const acceptedDataTypes = ["ddStream"];

const componentInformation = "shows number streams (recharts)";

const componentExplanation =
	"This is a DynDash Component that takes in Sources that hold Streams of Numbers, in order to turn them into Line Charts generated through Recharts.";

const componentIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		className="size-6"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
		/>
	</svg>
);

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let className = `select-none rounded-lg border border-gray-600 flex items-center justify-center text-center w-full h-full`;

	// Extract unique keys for all value fields (now in the format sourceName/valueName)
	let valueKeys = Object.keys(data[0] || {}).filter((key) => key !== "name");

	// Filter out excluded keys based on the exclusion list
	valueKeys = valueKeys.filter((key) => {
		return !slotSettings?.exclude?.includes(key);
	});

	// Create Line components for each value key
	let elements = [];

	if (data.length > 1) {
		elements = valueKeys.map((key) => {
			let color = slotSettings?.colors?.[key] || "#82ca9d";

			return (
				<Line
					isAnimationActive={false}
					type="monotone"
					dataKey={key}
					stroke={color}
					dot={null}
					key={`${uuid}-line-${key}`}
				/>
			);
		});
	}

	let backgroundColor =
		slotSettings?.colors?.["general/background"] || "rgb(58, 59, 68)";
	let axisColor =
		slotSettings?.colors?.["general/axis"] || "rgb(202, 202, 202)";
	let gridColor = slotSettings?.colors?.["general/grid"] || "rgb(71, 72, 81)";
	let gridLinesColor =
		slotSettings?.colors?.["general/gridLines"] || "rgb(142, 142, 142)";
	let tooltipColor =
		slotSettings?.colors?.["general/tooltip"] || "rgb(80, 81, 88)";

	return (
		<div className={className} style={{ backgroundColor: backgroundColor }}>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={data}
					width={500}
					height={300}
					margin={{
						top: 5,
						right: 5,
						left: 5,
						bottom: 5,
					}}
				>
					<CartesianGrid
						strokeDasharray="3 3"
						fill={gridColor}
						stroke={gridLinesColor}
					/>
					<XAxis dataKey="name" stroke={axisColor} />
					<YAxis stroke={axisColor} />
					<Tooltip contentStyle={{ backgroundColor: tooltipColor }} />
					<Legend />
					{elements}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

// region dataValidator

const dataValidator = (data) => {
	let returnArray = [];
	for (let sourceName in data) {
		// This is where it is determined whether or not the data object holds a property of the type that this dd-Component seeks to use
		let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
			return key.includes("ddStream");
		});
		let property = undefined;

		if (compatibleProperty) {
			property = data[sourceName][compatibleProperty];
		}

		if (!property) {
			returnArray.push(sourceName);
			continue;
		}

		// This is where it is determined whether or not any of the properties of the matching type are actually holding the type of data needed
		let correctDataArray = [];

		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("ddStream")) continue;

			let existence =
				data[sourceName][propertyName] &&
				data[sourceName][propertyName].length !== 0;

			if (!existence) continue;

			// This is where custom compatibility logic would have to be implemented
			let compatibility =
				data[sourceName]?.ddStream &&
				Array.isArray(data[sourceName][propertyName]) &&
				data[sourceName][propertyName].every(
					(item) => typeof item === "object"
				);

			let compatibilityString = compatibility
				? "compatible"
				: "incompatible";

			correctDataArray.push(compatibilityString);
		}

		// If not a single one of the properties matching that are the type are compatible, then the entire source is incompatible
		if (!correctDataArray.includes("compatible")) {
			returnArray.push(sourceName);
		}
	}
	return returnArray;
};

// region dataProcessor

const dataProcessor = (data, slotSettings) => {
	// Create a unified array of data
	let unifiedData = [];

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("ddStream")) continue;

			let stream = data[sourceName][propertyName];
			if (!stream) continue;

			stream.forEach((entry) => {
				// Create a new entry to avoid mutating the original data
				let newEntry = { ...entry };

				// Rename keys to include sourceName, keeping `name` intact
				Object.keys(newEntry).forEach((key) => {
					if (key !== "name") {
						newEntry[`${sourceName}/${key}`] = newEntry[key];
						delete newEntry[key]; // Remove the old key
					}
				});

				// Find or create the object for this `name`
				let existingEntry = unifiedData.find(
					(e) => e.name === newEntry.name
				);
				if (existingEntry) {
					Object.assign(existingEntry, newEntry);
				} else {
					unifiedData.push(newEntry);
				}
			});
		}
	}

	return unifiedData;
};

// region Exports

const bundle = {
	name: componentName,
	icon: componentIcon,
	information: componentInformation,
	explanation: componentExplanation,
	dataTypes: acceptedDataTypes,
	customSettingsPane: false,
	settingsMapper: false,
	generalSettings: ["background", "axis", "grid", "gridLines", "tooltip"],
	dataValidator: dataValidator,
	dataProcessor: dataProcessor,
	renderFunction: renderComponent,
};

export default bundle;
