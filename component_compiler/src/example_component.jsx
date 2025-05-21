let componentIcon = (
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
	let backgroundColor =
		slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";
	let textColor =
		slotSettings?.colors?.["general/text"] || "rgb(255, 255, 255)";
	let elements = [];

	for (let sourceName in data) {
		let index = 0;
		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("customDT")) continue;

			let customDT = data[sourceName][propertyName];
			if (!customDT) continue;

			elements.push(
				<p
					key={`${sourceName}-${propertyName}-${index}`}
					style={{
						padding: "1em",
						borderRadius: "15px",
						backgroundColor: "rgba(50, 50, 50, 0.2)",
					}}
				>
					{customDT}
				</p>
			);
			index++;
		}
	}

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: backgroundColor,
				color: textColor,
			}}
		>
			{elements}
		</div>
	);
};

// region dataValidator

let dataValidator = (data) =>
	Object.entries(data)
		.filter(([source, value]) => {
			const customKeys = Object.keys(value).filter((key) =>
				key.includes("customDT")
			);
			return (
				!customKeys.length ||
				!customKeys.some(
					(key) =>
						value[key] &&
						value[key].length &&
						value.customDT &&
						Array.isArray(value[key])
				)
			);
		})
		.map(([source]) => source);

// region Exports

const bundle = {
	name: "Example Component",
	icon: componentIcon,
	information: "can display customDT",
	explanation:
		"Just a bare-bones Example Component that accepts customDT Sources",
	dataTypes: ["customDT"],
	customSettingsPane: false,
	settingsMapper: false,
	generalSettings: ["background", "text"],
	dataValidator: dataValidator,
	dataProcessor: null,
	renderFunction: renderComponent,
	bypassEmpty: false,
};

export default bundle;
