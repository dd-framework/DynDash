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

const componentName = "LabRecorder Panel";

const acceptedDataTypes = [["ddURL*", "ddStatus*"]];

const componentInformation = "control panel from url + status collection";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in a Source that holds an URL
			Collection and a Source that holds Status Collections from a LSL
			Data API's LabRecorder endpoints. It generates a neat little Control
			Panel that can adjust the LabRecorder settings of such an API's
			LabRecorder Endpoints.
		</p>
		<p>
			Since this is a DynDash Component that is custom-tailored to a
			specific API endpoint, the URL and Status Collections need to
			include a very specific set of keys.
		</p>
		<div className="flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<div className="w-[50%]">
				<p>URL Collection:</p>
				<ul className="text-sm space-y-1">
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Connect LabRecorder
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Set LabRecorder
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Start LabRecorder
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Stop LabRecorder
						</span>
					</li>
				</ul>
			</div>
			<div className="w-[50%]">
				<p>Status Collection:</p>
				<ul className="text-sm space-y-1">
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							LabRecorder Connected
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							LabRecorder Preset
						</span>
					</li>
				</ul>
			</div>
		</div>
		<p>
			All Buttons of the Panel also dispatch any events passed under the
			"dispatch" key of the response Object received for their request.
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
			It is possible to hide the title and explanations by adding the
			following keys to the exclude array:
		</p>
		<div className="space-x-1 text-sm flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<span className="bg-gray-900/50 px-2 rounded-lg">title</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">general/info</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">
				recording/info
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
			d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
		/>
	</svg>
);

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let source_with_url = undefined;
	let source_with_status = undefined;

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (propertyName.includes("ddURL")) {
				source_with_url = sourceName;
			}
			if (propertyName.includes("ddStatus")) {
				source_with_status = sourceName;
			}
		}
	}

	let createButton = (urlKey) => {
		let urls = data[source_with_url]["ddURL"];

		let { url, method, headers, body } = urls[urlKey];

		let exclusion = slotSettings?.exclude?.includes(
			`${source_with_url}/${urlKey}`
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
			slotSettings?.colors?.[`${source_with_url}/${urlKey}`] ||
			"rgb(83, 120, 255)";

		let buttonOnClick = async (e) => {
			e.stopPropagation();

			if (["Set LabRecorder", "Start LabRecorder"].includes(urlKey)) {
				let basePanel = e?.target?.closest(".lrBasePanel");
				let newBody = {};

				const fields = [
					"task",
					"run",
					"participant",
					"session",
					"acquisition",
					"modality",
				];

				for (let field of fields) {
					let input = basePanel?.querySelector(`#${field}`);
					let value = input?.value;

					let newValue = value
						.replaceAll("\\", "_")
						.replaceAll("/", "_")
						.replaceAll("|", "_")
						.replaceAll("<", "_")
						.replaceAll(">", "_")
						.replaceAll(":", "_")
						.replaceAll(`"`, "_")
						.replaceAll("?", "_")
						.replaceAll("*", "_")
						.replaceAll(".", "_")
						.replaceAll(" ", "_");

					if (field === "run") {
						newValue = parseInt(newValue) || 1;
					}

					if (value) {
						newBody[field] = newValue;
					}
				}

				requestObject.body = JSON.stringify(newBody);
			}

			try {
				const response = await fetch(url, requestObject);

				if (!response.ok) {
					console.log(
						`Button Component for ${source_with_url} (${urlKey}) received an error response!`
					);
				}

				let responseObject = await response.json();

				// In case the response wants to dispatch events into the application, do so
				if (responseObject?.dispatch && !slotSettings?.suppressEvents) {
					for (let eventName of Object.keys(
						responseObject?.dispatch
					)) {
						let eventBody = responseObject?.dispatch[eventName];

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
					`Button Component for ${source_with_url} (${urlKey}) failed to get a response!`
				);
			}
		};

		return (
			<button
				className="text-white flex-grow-1 min-w-fit m-1 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 shadow-md hover:shadow-blue-500/50 hover:ring-2 hover:ring-blue-300"
				key={`${uuid}-${source_with_url}/${urlKey}`}
				style={{ backgroundColor: buttonColor }}
				onClick={buttonOnClick}
			>
				{urlKey}
			</button>
		);
	};

	let createStatus = (statusKey) => {
		let status = data[source_with_status]["ddStatus"];

		let value = status[statusKey];

		let exclusion = slotSettings?.exclude?.includes(
			`${source_with_status}/${statusKey}`
		);

		if (exclusion) return null;

		let statusColor =
			slotSettings?.colors?.[`${source_with_status}/${statusKey}`] ||
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
				key={`${uuid}-${source_with_status}/${statusKey}`}
				style={{ backgroundColor: statusColor }}
			>
				{statusKey}
				{displayValue}
			</p>
		);
	};

	let backgroundColor =
		slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";
	let textColor =
		slotSettings?.colors?.["general/text"] || "rgb(255, 255, 255)";
	let className = `rounded-lg border border-gray-600 flex flex-col flex-grow-1 w-full h-full max-w-full max-h-full justify-center items-center`;

	let titleShow = !slotSettings?.exclude?.includes(`title`);
	let generalInfoShow = !slotSettings?.exclude?.includes(`general/info`);
	let recordingInfoShow = !slotSettings?.exclude?.includes(`recording/info`);

	let connectLR = createButton("Connect LabRecorder");
	let lrStatus = createStatus("LabRecorder Connected");
	let lrPreset = data[source_with_status]["ddStatus"]["LabRecorder Preset"];

	let connectionPanel = (
		<div className="p-2 my-3 text-left text-lg space-x-2 bg-gray-300/10 rounded-lg w-[90%]">
			<p>Connection:</p>

			<div className="flex flex-row text-sm w-full justify-center items-center overflow-auto">
				{connectLR}
				{lrStatus}
			</div>
		</div>
	);

	if (!connectLR && !lrStatus) {
		connectionPanel = null;
	}

	let setLR = createButton("Set LabRecorder");
	let startLR = createButton("Start LabRecorder");
	let stopLR = createButton("Stop LabRecorder");

	let fields = lrPreset || {
		task: "MemoryGuided",
		run: "2",
		participant: "P003",
		session: "Session1",
		acquisition: "Acq1",
		modality: "eeg",
	};

	let basePanel = (
		<div
			className="p-2 my-3 text-left text-lg space-x-2 bg-gray-300/10 rounded-lg w-[90%] lrBasePanel"
			onClick={(e) => e.stopPropagation()}
		>
			<p>Recording Settings:</p>

			{recordingInfoShow && (
				<p className="text-left text-xs">
					The LabRecorder itself has a couple of Recording Settings
					that can be set through this interface:
				</p>
			)}

			<div className="flex flex-col text-black w-full justify-center items-center overflow-auto">
				<div className="flex flex-wrap gap-4 p-4">
					{Object.entries(fields).map(([key, placeholder]) => (
						<div
							key={key}
							className="flex flex-col text-sm w-[30%]"
						>
							<label
								className="mb-1 capitalize"
								style={{ color: textColor }}
							>
								{key}:
							</label>
							<input
								id={key}
								type={key === "run" ? "number" : "text"}
								placeholder={placeholder}
								defaultValue={placeholder}
								className="p-2 rounded bg-gray-500 text-white"
							/>
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-row text-sm w-full justify-center items-center overflow-auto">
				{setLR}
				{startLR}
				{stopLR}
			</div>
		</div>
	);

	if (!setLR && !startLR && !stopLR) {
		basePanel = null;
	}

	return (
		<div className="select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-col items-center">
			<div
				className={className}
				style={{ backgroundColor: backgroundColor, color: textColor }}
			>
				<div className="w-[90%]">
					{titleShow && (
						<h2 className="text-2xl p-2 my-3 bg-gray-300/10 rounded-lg">
							LabRecorder Control Panel
						</h2>
					)}
					{generalInfoShow && (
						<p className="text-left text-xs">
							This is a Control Panel for the LabRecorder API
							endpoints of the LSL Data API Application. It can be
							used instead of adding a ddURL Component and a
							ddStatus Component separately, but it only accepts
							the ddURL and ddStatus Sources specifically provided
							by the LSL Data API to control its connection to the
							LabRecorder.
						</p>
					)}
				</div>
				{connectionPanel}
				{basePanel}
			</div>
		</div>
	);
};

// region dataValidator

const dataValidator = (data) => {
	let returnArray = [];
	for (let sourceName in data) {
		// This is where it is determined whether or not the data object holds a property of the type that this dd-Component seeks to use
		let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
			return key.includes("ddURL") || key.includes("ddStatus");
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
			if (
				!propertyName.includes("ddURL") &&
				!propertyName.includes("ddStatus")
			)
				continue;

			let existence =
				data[sourceName][propertyName] &&
				Object.keys(data[sourceName][propertyName])?.length !== 0;

			if (!existence) continue;

			// This is where custom compatibility logic would have to be implemented
			let compatibility =
				data[sourceName]?.[propertyName] &&
				typeof data[sourceName][propertyName] === "object";

			if (compatibility && propertyName.includes("ddStatus")) {
				let neededKeys = [
					"LabRecorder Connected",
					"LabRecorder Preset",
				];

				// See if the Status is made for the specific API
				for (let neededKey of neededKeys) {
					if (
						!Object.keys(data[sourceName][propertyName]).includes(
							neededKey
						)
					) {
						compatibility = false;
						break;
					}
				}
			} else if (compatibility && propertyName.includes("ddURL")) {
				let neededKeys = [
					"Connect LabRecorder",
					"Set LabRecorder",
					"Start LabRecorder",
					"Stop LabRecorder",
				];

				// See if the URL is made for the specific API
				for (let neededKey of neededKeys) {
					if (
						!Object.keys(data[sourceName][propertyName]).includes(
							neededKey
						)
					) {
						compatibility = false;
						break;
					}
				}
			}

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
	generalSettings: ["background", "text"],
	dataValidator: dataValidator,
	renderFunction: renderComponent,
};

export default bundle;
