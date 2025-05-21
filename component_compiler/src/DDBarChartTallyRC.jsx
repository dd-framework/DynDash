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
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

// region Component Information

const componentName = "Bar Chart (Tally)";

const acceptedDataTypes = ["ddStream"];

const componentInformation = "summarizes any streams (recharts)";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources that hold Streams
			of any value type, in order to turn them into Bar Charts that show
			the total tally of value occurances. The Charts are generated
			through Recharts.
		</p>
		<p>
			By default, this DynDash Component groups by value, but it is
			possible to create manual grouping logic through the SlotSettings.
		</p>
		<p>
			To do so, create a top-level key called "DDBCTGroups" that holds an
			array of Group Objects that look like this:
		</p>
		<p className="bg-gray-800 text-white p-2 rounded-md font-mono text-sm overflow-auto">
			{"{"}
			<br />
			&nbsp;&nbsp;&nbsp;&nbsp;groupName: "group_A",
			<br />
			&nbsp;&nbsp;&nbsp;&nbsp;groupFilter: "'ABCDEFG'.includes($VALUE)"
			<br />
			{"}"}
		</p>
		<p>
			Note that you can pass any JavaScript boolean calculation into the
			filter string. While this is unsafe, it will be evaluated. "$VALUE"
			will be replaced with the value that is being filtered.
		</p>
	</div>
);

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
			d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
		/>
	</svg>
);

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let className = `select-none rounded-lg border border-gray-600 flex items-center justify-center text-center w-full h-full`;
	let generalColor = slotSettings?.colors?.DDBCBars || "#82ca9d";

	let cells = data.map((dataItem, index) => {
		return (
			<Cell
				key={`${uuid}-barcell-${dataItem.name}-${index}`}
				fill={dataItem.color}
			/>
		);
	});

	let elements = (
		<Bar isAnimationActive={false} dataKey="data" fill={generalColor}>
			{cells}
		</Bar>
	);

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
				<BarChart
					data={data}
					width={500}
					height={300}
					margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
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
				</BarChart>
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

	// Filter out excluded keys based on the exclusion list
	let excludedKeys = slotSettings?.exclude || [];

	unifiedData.forEach((entry) => {
		Object.keys(entry).forEach((key) => {
			if (excludedKeys.includes(key)) {
				delete entry[key];
			}
		});
	});

	let generalColor = slotSettings?.colors?.DDBCBars || "#82ca9d";

	// Counting Occurances
	let valueCounts = {};

	// Checking whether or not valid Group Settings are present
	let groups = slotSettings?.DDBCTGroups;
	let groupsValid =
		Array.isArray(groups) &&
		groups.length > 0 &&
		groups.every(
			(group) =>
				group &&
				typeof group === "object" &&
				group.hasOwnProperty("groupName") &&
				group.groupName &&
				group.hasOwnProperty("groupFilter") &&
				group.groupFilter
		);

	// In case there is custom grouping, apply it, otherwise, just count up
	unifiedData.forEach((entry) => {
		Object.entries(entry).forEach(([key, value]) => {
			if (key !== "name") {
				if (groups && groupsValid) {
					groups.forEach((group) => {
						let filter = group.groupFilter.replace("$VALUE", value);
						let filterPasses = eval(filter);

						if (filterPasses) {
							if (!valueCounts[group.groupName]) {
								valueCounts[group.groupName] = {
									count: 0,
									color: group.groupColor || generalColor,
								};
							}
							valueCounts[group.groupName].count += 1;
						}
					});
				} else {
					if (!valueCounts[value]) {
						valueCounts[value] = {
							count: 0,
							color: generalColor,
						};
					}
					valueCounts[value].count += 1;
				}
			}
		});
	});

	// Reformating
	let chartData = Object.entries(valueCounts).map(([key, value]) => ({
		name: key,
		data: value.count,
		color: value.color,
		borderWidth: 0,
	}));

	// Sorting based on strings, or numbers if it's possible to convert
	chartData.sort((a, b) => {
		a.name = isNaN(a.name) ? a.name : Number(a.name).toFixed(2);
		b.name = isNaN(b.name) ? b.name : Number(b.name).toFixed(2);
		return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
	});

	return chartData;
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
