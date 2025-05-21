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
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Bounds } from "@react-three/drei";

// region Component Information

const componentName = "MoCap Display";

const acceptedDataTypes = ["LiAQualisys"];

const componentInformation = "displays newest point in LiAQualisys";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources that hold data of
			type LiAQualisys. It generates a 3D Canvas that displays the newest
			position of all markers.
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
			d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
		/>
	</svg>
);

const settingsMapper = (sourceData) => {
	if (sourceData?.LiAQualisys) {
		let points = sourceData?.LiAQualisys[0]?.points;
		let keys = points ? Object.keys(points) : [];
		if (keys?.length > 0) return keys;
	}
};

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let backgroundColor =
		slotSettings?.colors?.["general/background"] || "rgb(71, 72, 81)";
	let textColor =
		slotSettings?.colors?.["general/labels"] || "rgb(255, 255, 255)";

	return (
		<div
			className="select-none bg-gray-700 relative group rounded-lg border-gray-700 w-full h-full flex flex-col items-center"
			style={{ backgroundColor: backgroundColor }}
		>
			<Canvas
				style={{ width: "100%", height: "100%" }}
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				{/* Basic lighting */}
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} />

				{/* Allow the user to orbit around the scene */}
				<OrbitControls />

				{/* The Bounds helper will auto-adjust the camera to frame all objects */}
				<Bounds fit clip margin={1}>
					{Object.entries(data).map(([name, coords], index) => {
						// Ensure that coords is an array with at least 3 numbers (x, y, z)
						if (!Array.isArray(coords) || coords.length < 3)
							return null;
						let [x, y, z] = coords;
						let sphereColor = "orange";
						let displayName = name.split("/")[1];
						try {
							sphereColor = slotSettings?.colors[name];
						} catch {}
						return (
							<group key={index}>
								{/* The point marker */}
								<mesh position={[x, y, z]}>
									<sphereGeometry args={[0.1, 16, 16]} />
									<meshStandardMaterial color={sphereColor} />
								</mesh>
								{/* The label for the point, offset slightly so it doesn’t overlap */}
								<Text
									position={[x + 0.2, y, z]}
									fontSize={0.2}
									color={textColor}
									material-depthTest={false}
								>
									{displayName}
								</Text>
							</group>
						);
					})}
				</Bounds>
			</Canvas>
			<div className="bg-black/30 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition p-2 rounded-full absolute top-1 left-1 cursor-pointer">
				{"Settings"}
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
			return key.includes("LiAQualisys");
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
			if (!propertyName.includes("LiAQualisys")) continue;

			let existence =
				data[sourceName][propertyName] &&
				data[sourceName][propertyName].length !== 0;

			if (!existence) continue;

			// This is where custom compatibility logic would have to be implemented
			let compatibility =
				data[sourceName]?.[propertyName] &&
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

// region dataProcessor

const dataProcessor = (data, slotSettings) => {
	let points = {};

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			if (!propertyName.includes("LiAQualisys")) continue;

			let streamEntries = data[sourceName][propertyName];
			let lastEntry = streamEntries[streamEntries?.length - 1] || {};
			let lastPoints = lastEntry?.points;

			let lastPointsRenamed = lastPoints
				? Object.fromEntries(
						Object.entries(lastPoints).map(([key, value]) => [
							`${sourceName}/${key}`,
							value,
						])
				  )
				: {};

			if (slotSettings?.exclude) {
				for (let exclusion of slotSettings?.exclude) {
					delete lastPointsRenamed[exclusion];
				}
			}

			points = {
				...points,
				...lastPointsRenamed,
			};
		}
	}

	return points;
};

// region Exports

const bundle = {
	name: componentName,
	icon: componentIcon,
	information: componentInformation,
	explanation: componentExplanation,
	dataTypes: acceptedDataTypes,
	customSettingsPane: false,
	settingsMapper: settingsMapper,
	generalSettings: ["background", "labels"],
	dataValidator: dataValidator,
	dataProcessor: dataProcessor,
	renderFunction: renderComponent,
};

export default bundle;
