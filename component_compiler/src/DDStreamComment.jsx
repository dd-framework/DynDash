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
import React from "react";

// region Component Information

const componentName = "Comment";

const acceptedDataTypes = ["ddStream"];

const componentInformation = "lists any streams, displays comment";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that lists the provided sources and
			displays a user-defined comment element that can be defined in the
			Settings Object.
		</p>
		<p>
			To do so, create a top-level key called "DDStreamComment" that holds
			any string you want displayed. This may not be able to include JSX
			code.
		</p>
		<p className="bg-gray-800 text-white p-2 rounded-md font-mono text-sm overflow-auto">
			DDStreamComment: "{`<div>Comment Here</div>`}"
			<br />
		</p>
		<p>
			Per default, the comment element will take on the same color as the
			general background color. However, you can specify this comment
			element's background color with the key DDStreamComment in the
			"colors" object.
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
	let backgroundColor =
		slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";

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
				let keyColor =
					slotSettings?.colors?.[`${sourceName}/${keyName}`] ||
					"rgb(202, 202, 202)";

				return (
					<p
						key={`${uuid}-${sourceName}/${keyName}`}
						style={{ color: keyColor }}
					>
						{keyName}
					</p>
				);
			});

			let textColor = slotSettings?.colors || "text-white";
			let className = `${textColor} rounded-lg border border-gray-600 flex flex-row items-center flex-grow-1`;

			elements.push(
				<div
					className={className}
					style={{ backgroundColor: backgroundColor }}
					key={`${uuid}-${sourceName}`}
				>
					<p className="text-lg p-2">{sourceName}</p>
					<p>{" ("}</p>
					<span className="flex flex-row space-x-2">
						{valueElements}
					</span>
					<p>{")"}</p>
				</div>
			);
		}
	}

	let commentElement = slotSettings?.DDStreamComment || "// Comment";
	if (typeof commentElement === "string") {
		let commentElementArray = commentElement.split("\n");

		commentElement = commentElementArray.map((item, index) => (
			<React.Fragment key={`${uuid}-${item}-${index}`}>
				{item}
				{index !== commentElementArray.length - 1 && <br />}
			</React.Fragment>
		));
	}
	let commentColor =
		slotSettings?.colors?.["general/comment"] || backgroundColor;
	let commentTextColor =
		slotSettings?.colors?.["general/commentText"] || "#ffffff";

	return (
		<div className="select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-col overflow-scroll">
			<div className="flex-grow-1">{elements}</div>
			<div
				className={`flex min-h-[50%] p-2 text-left w-full h-full rounded-lg items-center justify-center`}
				style={{
					backgroundColor: commentColor,
					color: commentTextColor,
				}}
			>
				<p>{commentElement}</p>
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
	generalSettings: ["background", "comment", "commentText"],
	dataValidator: dataValidator,
	renderFunction: renderComponent,
	bypassEmpty: true,
};

export default bundle;
