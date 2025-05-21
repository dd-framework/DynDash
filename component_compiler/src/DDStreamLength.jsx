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

const componentName = "Length Counter";

const acceptedDataTypes = ["ddStream"];

const componentInformation = "lists any streams, displays length";

const componentExplanation =
	"This is a DynDash Component that takes in Sources that hold Streams of any value type, in order to list the length of each of the individual Streams.";

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
			d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"
		/>
	</svg>
);

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let elements = [];

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("ddStream")) continue;

			let stream = data[sourceName][propertyName];
			if (!stream) continue;

			let valueKeys = Object.keys(stream[0] || {}).filter(
				(key) => key !== "name"
			);
			valueKeys = valueKeys.filter((key) => {
				return !slotSettings?.exclude?.includes(`${sourceName}/${key}`);
			});

			let valueElements = valueKeys.map((keyName) => {
				let amount = stream.filter((streamElement) => {
					return Object.keys(streamElement).includes(keyName);
				}).length;
				let keyColor =
					slotSettings?.colors?.[`${sourceName}/${keyName}`] ||
					"rgb(202, 202, 202)";

				return (
					<p
						key={`${uuid}-${sourceName}/${keyName}`}
						style={{ color: keyColor }}
					>
						{keyName}: {amount}
					</p>
				);
			});

			let backgroundColor =
				slotSettings?.colors?.["general/background"] ||
				"rgb(71, 72, 81)";
			let textColor = slotSettings?.colors || "text-white";
			let className = `${textColor} rounded-lg border border-gray-600 flex flex-col w-full h-full max-w-full max-h-full flex-grow-1`;

			elements.push(
				<div
					className={className}
					style={{ backgroundColor: backgroundColor }}
					key={`${uuid}-${sourceName}`}
				>
					<p className="text-lg my-3">{sourceName}</p>
					{valueElements}
				</div>
			);
		}
	}

	return (
		<div className="select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-row">
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
				Array.isArray(data[sourceName][propertyName]);

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
