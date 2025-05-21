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

const componentName = "LiA API Panel";

const acceptedDataTypes = [["ddURL*", "ddURL*", "ddStatus*"]];

const componentInformation = "control panel from url + status collection";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in two Sources that hold an
			URL Collection and a Source that holds Status Collections from a LSL
			Data API. It generates a neat little Control Panel that can adjust
			the settings of such an API.
		</p>
		<p>
			Since this is a DynDash Component that is custom-tailored to a
			specific API, the URL and Status Collections need to include a very
			specific set of keys.
		</p>
		<div className="flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<div className="w-[33%]">
				<p>Status Collection:</p>
				<ul className="text-sm space-y-1">
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Sending Interval
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Pulling Timeout
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Anomaly Threshold
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Anomaly Window
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Serving
						</span>
					</li>
				</ul>
			</div>
			<div className="w-[33%]">
				<p>One of the URL Collections:</p>
				<ul className="text-sm space-y-1">
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Scan for Devices
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Purge Devices
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Threshold -
						</span>
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Threshold +
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Window -
						</span>
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Window +
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Sending -
						</span>
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Sending +
						</span>
					</li>
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Pulling -
						</span>
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Pulling +
						</span>
					</li>
				</ul>
			</div>
			<div className="w-[33%]">
				<p>The other URL Collection:</p>
				<ul className="text-sm space-y-1">
					<li className="space-x-1">
						<span className="bg-gray-900/50 px-2 rounded-lg">
							Load Dummy
						</span>
					</li>
				</ul>
			</div>
		</div>
		<p>
			As a general rule-of-thumb, this Component requires the Sources with
			the display names{" "}
			<span className="bg-gray-900/50 px-2 rounded-lg">
				LSL Data API Actions
			</span>
			{", "}
			<span className="bg-gray-900/50 px-2 rounded-lg">
				LSL Data API Status
			</span>
			{", and "}
			<span className="bg-gray-900/50 px-2 rounded-lg">
				LSL Data API Recording Loaders
			</span>
		</p>
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
			<span className="bg-gray-900/50 px-2 rounded-lg">serving/info</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">lsl/info</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">anomaly/info</span>
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
	let source_with_loading = undefined;

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (propertyName.includes("ddURL")) {
				let urlKeys = Object.keys(data[sourceName][propertyName]);

				if (urlKeys?.includes("Scan for Devices")) {
					source_with_url = sourceName;
				} else if (urlKeys?.includes("Load Dummy")) {
					source_with_loading = sourceName;
				}
			}
			if (propertyName.includes("ddStatus")) {
				source_with_status = sourceName;
			}
		}
	}

	let createButton = (urlKey) => {
		let relevantSource = source_with_url;
		let displayKey = urlKey;

		if (urlKey === "Load") {
			urlKey = "Load Dummy";
			displayKey = "Load";
			relevantSource = source_with_loading;
		}

		let urls = data[relevantSource]["ddURL"];

		let { url, method, headers, body } = urls[urlKey];

		let exclusion = slotSettings?.exclude?.includes(
			`${relevantSource}/${urlKey}`
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
			slotSettings?.colors?.[`${relevantSource}/${urlKey}`] ||
			"rgb(83, 120, 255)";

		let buttonOnClick = async (e) => {
			e.stopPropagation();

			let fetchURL = url;

			if (urlKey === "Load Dummy") {
				let dropdown = e?.target
					?.closest("span")
					?.querySelector("select");

				if (!dropdown) return;

				let newKey = dropdown?.value;
				let { method, headers, body } = urls[newKey];
				fetchURL = urls[newKey]?.url;

				requestObject = {
					method: method || "POST",
					headers: headers || { "Content-Type": "application/json" },
				};

				if (requestObject.method === "POST" && body) {
					requestObject.body = JSON.stringify(body);
				}
			}

			console.log(fetchURL, requestObject);

			try {
				const response = await fetch(fetchURL, requestObject);

				if (!response.ok) {
					console.log(
						`Button Component for ${relevantSource} (${displayKey}) received an error response!`
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
					`Button Component for ${relevantSource} (${displayKey}) failed to get a response!`
				);
			}
		};

		return (
			<button
				className="text-white flex-grow-1 min-w-fit m-1 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 shadow-md hover:shadow-blue-500/50 hover:ring-2 hover:ring-blue-300"
				key={`${uuid}-${relevantSource}/${urlKey}`}
				style={{ backgroundColor: buttonColor }}
				onClick={buttonOnClick}
			>
				{displayKey}
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

	let createDropdown = (list) => {
		let dropdownColor =
			slotSettings?.colors?.[`${source_with_loading}/Load Dummy`] ||
			"rgb(83, 120, 255)";

		return (
			<select
				className="
			  w-9 h-9
			  rounded
			  appearance-none text-transparent
			  cursor-pointer focus:outline-none
			  bg-[url('data:image/svg+xml,%3Csvg%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M19%209l-7%207-7-7%22%3E%3C/path%3E%3C/svg%3E')]
			  bg-no-repeat bg-center
			"
				style={{ backgroundColor: dropdownColor }}
			>
				{Object.keys(list).map((key) => {
					if (key === "Load Dummy") {
						return null;
					}
					return (
						<option key={key} value={key} className="text-black">
							{key}
						</option>
					);
				})}
			</select>
		);
	};

	let backgroundColor =
		slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";
	let textColor =
		slotSettings?.colors?.["general/text"] || "rgb(255, 255, 255)";
	let className = `rounded-lg border border-gray-600 flex flex-col flex-grow-1 w-full h-full max-w-full max-h-full justify-center items-center`;

	let titleShow = !slotSettings?.exclude?.includes(`title`);
	let generalInfoShow = !slotSettings?.exclude?.includes(`general/info`);
	let servingInfoShow = !slotSettings?.exclude?.includes(`serving/info`);
	let lslInfoShow = !slotSettings?.exclude?.includes(`lsl/info`);
	let anomalyInfoShow = !slotSettings?.exclude?.includes(`anomaly/info`);

	let scanButton = createButton("Scan for Devices");
	let purgeButton = createButton("Purge Devices");
	let serveMode = createStatus("Serving");
	let isServing = data[source_with_status]["ddStatus"]["Serving"];

	let hasLoaders =
		Object.keys(data[source_with_loading]?.["ddURL"] || {})?.length > 1;
	let loadList = hasLoaders
		? createDropdown(data[source_with_loading]?.["ddURL"])
		: null;
	let loadButton = createButton("Load");

	let scanSettings = servingInfoShow ? (
		<div className="p-2 my-3 bg-gray-300/10 rounded-lg w-[90%] text-sm">
			<div className="w-full flex justify-center items-center">
				<span className="w-[35%] ">{scanButton}</span>
				<span className="text-xs w-[65%]">
					{"(Discover LSL Streams and switch to Live Serving)"}
				</span>
			</div>
			<div className="w-full flex justify-center items-center">
				<span className="w-[35%] ">{purgeButton}</span>
				<span className="text-xs w-[65%]">
					{"(Purge all Devices from Memory and stop Serving)"}
				</span>
			</div>
			{hasLoaders && (
				<div className="w-full flex justify-center items-center">
					<span className="w-[35%] ">
						{loadList}
						{loadButton}
					</span>
					<span className="text-xs w-[65%]">
						{"(Purge all Devices ..., load and serve Selection)"}
					</span>
				</div>
			)}
			{isServing && (
				<div className="flex items-center justify-center w-full">
					{serveMode}
				</div>
			)}
		</div>
	) : (
		<div className="p-2 my-3 space-x-2 bg-gray-300/10 rounded-lg w-[90%] text-sm flex justify-center items-center">
			{scanButton}
			{purgeButton}
			{hasLoaders && (
				<span>
					{loadList}
					{loadButton}
				</span>
			)}
			{isServing && serveMode}
		</div>
	);

	if (!scanButton && !purgeButton && !isServing) {
		scanSettings = null;
	}

	let sendingMinus = createButton("Sending -");
	let sendingStatus = createStatus("Sending Interval");
	let sendingPlus = createButton("Sending +");

	let pullingMinus = createButton("Pulling -");
	let pullingStatus = createStatus("Pulling Timeout");
	let pullingPlus = createButton("Pulling +");

	let lslStreamSettings = (
		<div className="p-2 my-3 text-left text-lg space-x-2 bg-gray-300/10 rounded-lg w-[90%]">
			<p>LSL Stream Settings:</p>
			{lslInfoShow && (
				<p className="text-left text-xs">
					Sending dictates how often new batches of incoming data are
					sent, and the timeout represents the amount of time the API
					will wait in case the LSL stream does not provide any new
					values.
				</p>
			)}
			<div className="flex flex-row text-sm w-full justify-center items-center">
				{sendingMinus}
				{sendingStatus}
				{sendingPlus}
			</div>
			<div className="flex flex-row text-sm w-full justify-center items-center">
				{pullingMinus}
				{pullingStatus}
				{pullingPlus}
			</div>
		</div>
	);

	if (
		!sendingMinus &&
		!sendingStatus &&
		!sendingPlus &&
		!pullingMinus &&
		!pullingStatus &&
		!pullingPlus
	) {
		lslStreamSettings = null;
	}

	let thresholdMinus = createButton("Threshold -");
	let thresholdStatus = createStatus("Anomaly Threshold");
	let thresholdPlus = createButton("Threshold +");

	let windowMinus = createButton("Window -");
	let windowStatus = createStatus("Anomaly Window");
	let windowPlus = createButton("Window +");

	let anomalySettings = (
		<div className="p-2 my-3 text-left text-lg space-x-2 bg-gray-300/10 rounded-lg w-[90%]">
			<p>Anomaly Detection Settings:</p>
			{anomalyInfoShow && (
				<p className="text-left text-xs">
					The Threshold represents the sensitivity of the detection
					and the Window dictates how many points the anomaly
					detection uses as context.
				</p>
			)}
			<div className="flex flex-row text-sm w-full justify-center items-center">
				{thresholdMinus}
				{thresholdStatus}
				{thresholdPlus}
			</div>
			<div className="flex flex-row text-sm w-full justify-center items-center">
				{windowMinus}
				{windowStatus}
				{windowPlus}
			</div>
		</div>
	);

	if (
		!thresholdMinus &&
		!thresholdStatus &&
		!thresholdPlus &&
		!windowMinus &&
		!windowStatus &&
		!windowPlus
	) {
		anomalySettings = null;
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
							LSL Data API Control Panel
						</h2>
					)}
					{generalInfoShow && (
						<p className="text-left text-xs">
							This is a Control Panel for the API endpoints of the
							LSL Data API Application. It can be used instead of
							adding a ddURL Component and a ddStatus Component
							separately, but it only accepts the ddURL and
							ddStatus Sources specifically provided by the LSL
							Data API to control its base features.
						</p>
					)}
				</div>
				{scanSettings}
				{lslStreamSettings}
				{anomalySettings}
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
					"Sending Interval",
					"Pulling Timeout",
					"Anomaly Threshold",
					"Anomaly Window",
					"Serving",
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
					"Scan for Devices",
					"Purge Devices",
					"Threshold -",
					"Threshold +",
					"Window -",
					"Window +",
					"Sending -",
					"Sending +",
					"Pulling -",
					"Pulling +",
				];

				// See if the URL is for the API Controls
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

				// See if the URL is for the Loading
				if (!compatibility) {
					if (
						Object.keys(data[sourceName][propertyName]).includes(
							"Load Dummy"
						)
					) {
						compatibility = true;
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
