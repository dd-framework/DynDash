// region Component Information

const componentName = "Text Display";

const acceptedDataTypes = ["TextChoice"];

const componentInformation = "shows text and accompanying choices";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources that hold Text
			data. It generates a text field and additional text fields that
			display all of the associated choices. Status values.
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
			d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
		/>
	</svg>
);

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let elements = [];

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("TextChoice")) continue;

			let status = data[sourceName][propertyName];
			let keys = Object.keys(status);
			if (!status || keys?.length === 0) continue;

			let statusElements = keys.map((name, textindex) => {
				let value = status[name];

				let exclusion = slotSettings?.exclude?.includes(
					`${sourceName}/${name}`
				);

				if (exclusion) return null;

				let statusColor =
					slotSettings?.colors?.[`${sourceName}/${name}`] ||
					"rgb(38, 38, 38)";

				if (name === "text") {
					return (
						<p
							className={`text-white opacity-100 flex-grow-1 min-w-fit m-1 px-4 py-2`}
							key={`${uuid}-${sourceName}/${name}-${textindex}`}
						>
							{value}
						</p>
					);
				} else {
					return (
						<span
							className="flex flex-row"
							key={`${uuid}-${sourceName}/${name}-${textindex}`}
						>
							{value.map((element, index) => (
								<p
									className={`text-white opacity-100 flex-grow-1 min-w-fit m-1 px-4 py-2 rounded-full hover:bg-blue-500 transition duration-300 shadow-md`}
									key={`${uuid}-${sourceName}/${name}-${index}`}
									style={{ backgroundColor: statusColor }}
								>
									{element}
								</p>
							))}
						</span>
					);
				}
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

					<div className="flex flex-col m-1 p-4 bg-gray-300/10 rounded-lg flex-wrap items-center justify-center">
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
			return key.includes("TextChoice");
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
			if (!propertyName.includes("TextChoice")) continue;

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
