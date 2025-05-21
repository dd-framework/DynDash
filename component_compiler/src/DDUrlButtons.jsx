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

const componentName = "URL Button Panel";

const acceptedDataTypes = ["ddURL"];

const componentInformation = "uses any url collection, creates buttons";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources that hold URL
			Collections. It generates Buttons that can trigger requests to these
			URLs.
		</p>
		<p>
			The Buttons also dispatch any events passed under the "dispatch" key
			of the response Object received for their request.
		</p>
		<p>
			To prevent this from happening, create a "suppressEvents" key in the
			Slot Settings and set it to true.
		</p>
		<p className="bg-gray-800 text-white p-2 rounded-md font-mono text-sm overflow-auto">
			{"{"}
			<br />
			&nbsp;&nbsp;&nbsp;&nbsp;suppressEvents: true,
			<br />
			{"}"}
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
			d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
		/>
	</svg>
);

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let elements = [];

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("ddURL")) continue;

			let urls = data[sourceName][propertyName];
			let keys = Object.keys(urls);
			if (!urls || keys?.length === 0) continue;

			let buttonElements = keys.map((name) => {
				let { url, method, headers, body } = urls[name];

				let exclusion = slotSettings?.exclude?.includes(
					`${sourceName}/${name}`
				);

				if (exclusion) return null;

				// Building the Request Object in accordance with
				let requestObject = {
					method: method || "POST",
					headers: headers || { "Content-Type": "application/json" },
				};

				if (requestObject.method === "POST" && body) {
					requestObject.body = JSON.stringify(body);
				}

				let buttonColor =
					slotSettings?.colors?.[`${sourceName}/${name}`] ||
					"rgb(83, 120, 255)";

				let buttonOnClick = async (e) => {
					e.stopPropagation();

					try {
						const response = await fetch(url, requestObject);

						if (!response.ok) {
							console.log(
								`Button Component for ${sourceName} (${name}) received an error response!`
							);
						}

						let responseObject = await response.json();

						// In case the response wants to dispatch events into the application, do so
						if (
							responseObject?.dispatch &&
							!slotSettings?.suppressEvents
						) {
							for (let eventName of Object.keys(
								responseObject?.dispatch
							)) {
								let eventBody =
									responseObject?.dispatch[eventName];

								let newEvent = new CustomEvent(
									`${eventName}`,
									eventBody
								);

								document.dispatchEvent(newEvent);
							}
						}

						console.log(responseObject);
					} catch {
						console.log(
							`Button Component for ${sourceName} (${name}) failed to get a response!`
						);
					}
				};

				return (
					<button
						className="text-white flex-grow-1 min-w-fit m-1 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 shadow-md hover:shadow-blue-500/50 hover:ring-2 hover:ring-blue-300"
						key={`${uuid}-${sourceName}/${name}`}
						style={{ backgroundColor: buttonColor }}
						onClick={buttonOnClick}
					>
						{name}
					</button>
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
						{buttonElements}
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
			return key.includes("ddURL");
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
			if (!propertyName.includes("ddURL")) continue;

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
