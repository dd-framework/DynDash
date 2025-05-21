// region Component Information

const componentName = "Room Timer";

const acceptedDataTypes = ["ddStatus*"];

const componentInformation = "shows time of recent 2 rooms";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources that hold Status
			Collections, as long as the Status collection has the following
			keys:
		</p>
		<div className="space-x-1 text-sm flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<span className="bg-gray-900/50 px-2 rounded-lg">current_room</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">
				current_room_entry
			</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">
				previous_room
			</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">
				previous_room_entry
			</span>
		</div>
		<p>
			The Component will use these values in order to calculate the time
			spent inside of the rooms described by this
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
			d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
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
			if (
				!keys.includes("current_room") ||
				!keys.includes("current_room_entry") ||
				!keys.includes("previous_room") ||
				!keys.includes("previous_room_entry")
			) {
				continue;
			}

			let titleShow = !slotSettings?.exclude?.includes(
				`${sourceName}/title`
			);
			let backgroundColor =
				slotSettings?.colors?.["general/background"] ||
				"rgb(71, 72, 81)";

			let textColor =
				slotSettings?.colors?.["general/text"] || "rgb(255, 255, 255)";

			let roomColor =
				slotSettings?.colors?.[`${sourceName}/current_room`] ||
				textColor;
			let roomEntryColor =
				slotSettings?.colors?.[`${sourceName}/current_room_entry`] ||
				textColor;
			let previousColor =
				slotSettings?.colors?.[`${sourceName}/previous_room`] ||
				textColor;
			let previousEntryColor =
				slotSettings?.colors?.[`${sourceName}/previous_room_entry`] ||
				textColor;

			let roomStyle = {
				color: roomColor,
			};
			let roomEntryStyle = {
				color: roomEntryColor,
			};
			let previousStyle = {
				color: previousColor,
			};
			let previousEntryStyle = {
				color: previousEntryColor,
			};

			let className = `rounded-lg border border-gray-600 flex flex-col flex-grow-1 w-full h-full max-w-full max-h-full justify-center items-center`;

			let formatTimeDiff = (start, end) => {
				if (!start || !end) {
					start = Date.now();
					end = start;
				}
				const diffMs = end - start;
				const totalSeconds = Math.floor(diffMs / 1000);
				const minutes = Math.floor(totalSeconds / 60);
				const seconds = totalSeconds % 60;
				// Pad seconds with leading zero if needed
				return `${minutes}:${seconds.toString().padStart(2, "0")}`;
			};

			elements.push(
				<div
					className={className}
					style={{
						backgroundColor: backgroundColor,
						color: textColor,
					}}
					key={`${uuid}-${sourceName}`}
				>
					{titleShow && (
						<p className="text-lg p-2 my-3 bg-gray-300/10 rounded-lg w-fit">
							{sourceName}
						</p>
					)}

					<div className="flex flex-row m-1 p-4 bg-gray-300/10 rounded-lg flex-wrap justify-center space-y-2">
						<div
							className="flex flex-row justify-between items-center w-[90%] rounded-lg p-1"
							style={{ backgroundColor: backgroundColor }}
						>
							<span>
								<p>Current Room:</p>
								<p style={roomStyle}>{status.current_room}</p>
							</span>
							<span>
								<p>Spent Time:</p>
								<p style={roomEntryStyle}>
									{formatTimeDiff(
										status.current_room_entry,
										Date.now()
									)}
								</p>
							</span>
						</div>
						<div
							className="flex flex-row justify-between items-center w-[90%] rounded-lg p-1"
							style={{ backgroundColor: backgroundColor }}
						>
							<span>
								<p>Previous Room:</p>
								<p style={previousStyle}>
									{status.previous_room}
								</p>
							</span>
							<span>
								<p>Spent Time:</p>
								<p style={previousEntryStyle}>
									{formatTimeDiff(
										status.previous_room_entry,
										status.current_room_entry
									)}
								</p>
							</span>
						</div>
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

			if (compatibility && propertyName.includes("ddStatus")) {
				let neededKeys = [
					"current_room",
					"current_room_entry",
					"previous_room",
					"previous_room_entry",
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
