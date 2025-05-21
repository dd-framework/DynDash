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

// region Component Information

const componentName = "Status Display";

const acceptedDataTypes = ["ddStatus"];

const componentInformation = "shows status value collection";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources that hold Status
			Collections. It generates indicators that reflect the current value
			of the Status values.
		</p>
		<p>
			It is possible to hide the titles by adding the following key to the
			exclude array:
		</p>
		<div className="space-x-1 text-sm flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<span className="bg-gray-900/50 px-2 rounded-lg">
				SOURCENAME/title
			</span>
		</div>
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
			d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
		/>
	</svg>
);

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let elements = [];

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("ddStatus")) continue;

			let status = data[sourceName][propertyName];
			let keys = Object.keys(status);
			if (!status || keys?.length === 0) continue;

			let statusElements = keys.map((name) => {
				let value = status[name];

				let exclusion = slotSettings?.exclude?.includes(
					`${sourceName}/${name}`
				);

				if (exclusion) return null;

				let statusColor =
					slotSettings?.colors?.[`${sourceName}/${name}`] ||
					"rgb(83, 120, 255)";

				let displayValue = "";
				let statusOpacity = "opacity-100";

				let booleanValue = typeof value === "boolean";

				if (booleanValue) {
					statusOpacity = value ? "opacity-100" : "opacity-35";
				} else {
					displayValue = `: ${JSON.stringify(value)}`;
				}

				return (
					<p
						className={`text-white ${statusOpacity} flex-grow-1 min-w-fit m-1 px-4 py-2 rounded-full hover:bg-blue-500 transition duration-300 shadow-md`}
						key={`${uuid}-${sourceName}/${name}`}
						style={{ backgroundColor: statusColor }}
					>
						{name}
						{displayValue}
					</p>
				);
			});

			let titleShow = !slotSettings?.exclude?.includes(
				`${sourceName}/title`
			);
			let backgroundColor =
				slotSettings?.colors?.["general/background"] ||
				"rgb(71, 72, 81)";
			let textColor = slotSettings?.colors || "text-white";
			let className = `${textColor} rounded-lg border border-gray-600 flex flex-col flex-grow-1 w-full h-full max-w-full max-h-full justify-center items-center`;

			elements.push(
				<div
					className={className}
					style={{ backgroundColor: backgroundColor }}
					key={`${uuid}-${sourceName}`}
				>
					{titleShow && (
						<p className="text-lg p-2 my-3 bg-gray-300/10 rounded-lg w-fit">
							{sourceName}
						</p>
					)}

					<div className="flex flex-row m-1 p-4 bg-gray-300/10 rounded-lg flex-wrap justify-center">
						{statusElements}
					</div>
				</div>
			);
		}
	}

	return (
		<div className="select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-col items-center">
			{elements}
		</div>
	);
};

// region dataValidator

const dataValidator = (data) => {
	let returnArray = [];
	for (let sourceName in data) {
		// This is where it is determined whether or not the data object holds a property of the type that this dd-Component seeks to use
		let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
			return key.includes("ddStatus");
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
			if (!propertyName.includes("ddStatus")) continue;

			let existence =
				data[sourceName][propertyName] &&
				Object.keys(data[sourceName][propertyName])?.length !== 0;

			if (!existence) continue;

			// This is where custom compatibility logic would have to be implemented
			let compatibility =
				data[sourceName]?.[propertyName] &&
				typeof data[sourceName][propertyName] === "object";

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

// region Exports

const bundle = {
	name: componentName,
	icon: componentIcon,
	information: componentInformation,
	explanation: componentExplanation,
	dataTypes: acceptedDataTypes,
	customSettingsPane: false,
	settingsMapper: false,
	generalSettings: ["background"],
	dataValidator: dataValidator,
	renderFunction: renderComponent,
};

export default bundle;
