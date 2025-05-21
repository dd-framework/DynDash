// region Component Information

const componentName = "ES Image Map";

const acceptedDataTypes = [["ImageMap", "3DPositions"]];

const componentInformation = "shows image with markers";

const componentExplanation = (
	<div className="space-y-2">
		<p>
			This is a DynDash Component that takes in Sources that hold
			positional and image information. It will generate a 2D map and
			markers based on the Sources added to the Component's Slot.
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
		<p>
			If you want to change the shapes that are available to you for
			visualization, you can create a "shapes" array in the settings that
			works in the same way the "colors" array does. Supported Keys are
			listed below.
		</p>
		<div className="space-x-1 text-sm flex flex-row bg-gray-600 text-white p-2 rounded-md overflow-auto">
			<span className="bg-gray-900/50 px-2 rounded-lg">rectangle</span>
			<span className="bg-gray-900/50 px-2 rounded-lg">circle</span>
		</div>
		<p>
			You can add the word "hollow" to a shape in order to remove its
			filling and keep it as an outline. Adding the word "camera" will add
			a triangle to the shape, indicating its rotation.
		</p>
		<p>
			You can also add another array called "sizes" whose keys take
			integer values for side lengths that will determine the shape size.
		</p>
	</div>
);

// HEROICONS map
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
			d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
		/>
	</svg>
);

const settingsMapper = (sourceData) => {
	if (sourceData?.["3DPositions"]) {
		try {
			let points = sourceData?.["3DPositions"];
			let finalPoint = points[points?.length - 1];
			let keys = finalPoint ? Object.keys(finalPoint) : [];
			if (keys?.length > 0) return keys;
		} catch {
			return [];
		}
	}
};

// region renderComponent

const renderComponent = (uuid, data, slotSettings) => {
	let corners,
		base64Image,
		markersData = [];

	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			let isImageMap = propertyName.includes("ImageMap");
			if (!isImageMap) continue;

			let imageMap = data[sourceName][propertyName];
			base64Image = imageMap?.encodedImage;
			corners = imageMap?.corners;
			if (!base64Image || !corners) continue;
		}
	}

	// Secondary for-loop to ensure that the points are processed AFTER the corners are set
	for (let sourceName in data) {
		for (let propertyName in data[sourceName]) {
			let is3DPositions = propertyName.includes("3DPositions");
			if (!is3DPositions) continue;

			// Get markers from most recent position
			let positions = data[sourceName][propertyName];
			if (positions?.length < 1) continue;
			let position = positions[positions.length - 1];
			let markerKeys = Object.keys(position);
			if (markerKeys?.length < 1) continue;

			for (let marker of markerKeys) {
				let markerData = position[marker];
				markerData.name = marker;
				markerData.source = sourceName;
				markersData.push(markerData);
			}
		}
	}

	const handleCanvas = (node) => {
		if (!node || !base64Image || !corners) return;
		const ctx = node.getContext("2d");

		let width = window.innerWidth;
		ctx.canvas.width = width;
		let height = window.innerHeight;
		ctx.canvas.height = height;

		ctx.clearRect(0, 0, width, height);

		function map3DToCanvas(marker, corners, width, height) {
			// Get min/max for x and z from all corners
			const xs = [corners.TL.x, corners.TR.x, corners.BR.x, corners.BL.x];
			const zs = [corners.TL.z, corners.TR.z, corners.BR.z, corners.BL.z];
			const minX = Math.min(...xs);
			const maxX = Math.max(...xs);
			const minZ = Math.min(...zs);
			const maxZ = Math.max(...zs);

			// Normalize marker.x and marker.z to [0, 1]
			const percentX = (marker.x - minX) / (maxX - minX);
			const percentY = (marker.z - minZ) / (maxZ - minZ);

			// Map to canvas coordinates
			const canvasX = percentX * width;
			const canvasY = percentY * height;
			const canvasRotation = -((marker.ry || 0) * Math.PI) / 180;

			return { x: canvasX, y: canvasY, rotation: canvasRotation };
		}

		const img = new window.Image();
		img.onload = () => {
			ctx.clearRect(0, 0, node.width, node.height);

			ctx.save();
			ctx.translate(0, ctx.canvas.height);
			ctx.scale(1, -1);
			ctx.drawImage(img, 0, 0, node.width, node.height);
			ctx.restore();

			for (let marker of markersData) {
				let settingsKey = `${marker?.source}/${marker?.name}`;
				let isExcluded = slotSettings?.exclude?.includes(settingsKey);
				if (isExcluded) continue;

				let neededKeys = ["x", "z", "ry"];
				let presentKeys = Object.keys(marker);
				if (!neededKeys.every((val) => presentKeys?.includes(val))) {
					continue;
				}

				let mainColor =
					slotSettings?.colors?.[settingsKey] || "rgb(255, 0, 0)";
				let mainShape =
					slotSettings?.shapes?.[settingsKey]?.toLowerCase() ||
					"rectangle";
				let mainSize = slotSettings?.sizes?.[settingsKey] || 50;

				let { x, y, rotation } = map3DToCanvas(
					marker,
					corners,
					width,
					height
				);

				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(rotation);
				ctx.fillStyle = mainColor;
				ctx.strokeStyle = mainColor;
				ctx.lineWidth = 0.1 * mainSize;

				let isHollow = mainShape?.includes("hollow");

				if (mainShape?.includes("rectangle")) {
					if (isHollow) {
						ctx.strokeRect(
							-mainSize / 2,
							-mainSize / 2,
							mainSize,
							mainSize
						);
					} else {
						ctx.fillRect(
							-mainSize / 2,
							-mainSize / 2,
							mainSize,
							mainSize
						);
					}
				} else if (mainShape?.includes("circle")) {
					ctx.beginPath();
					ctx.arc(0, 0, mainSize / 2, 0, 2 * Math.PI);

					if (isHollow) {
						ctx.stroke();
					} else {
						ctx.fill();
					}
				}

				if (mainShape?.includes("camera")) {
					const arrowWidth = 0.6 * mainSize;
					const arrowHeight = 0.3 * mainSize;
					const arrowY = mainSize / 2;

					ctx.beginPath();
					ctx.moveTo(0, arrowY);
					ctx.lineTo(-arrowWidth / 2, arrowY + arrowHeight);
					ctx.lineTo(arrowWidth / 2, arrowY + arrowHeight);
					ctx.closePath();
					ctx.fillStyle = mainColor;

					if (isHollow) {
						ctx.stroke();
					} else {
						ctx.fill();
					}
				}

				ctx.restore();
			}
		};
		img.src = `data:image/png;base64,${base64Image}`;
	};

	return (
		<div className="select-none bg-gray-700 rounded-lg border-gray-700 w-full h-full flex flex-col items-center">
			<canvas
				ref={handleCanvas}
				style={{
					width: "100%",
					height: "100%",
					borderRadius: "0.5rem",
				}}
			/>
		</div>
	);
};

// region dataValidator

const dataValidator = (data) => {
	let returnArray = [];
	for (let sourceName in data) {
		// This is where it is determined whether or not the data object holds a property of the type that this dd-Component seeks to use
		let compatibleProperty = Object.keys(data[sourceName]).find((key) => {
			return key.includes("ImageMap") || key.includes("3DPositions");
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
			if (propertyName.includes("ImageMap")) {
				let existence =
					data[sourceName][propertyName] &&
					Object.keys(data[sourceName][propertyName])?.length !== 0;

				if (!existence) continue;

				// This is where custom compatibility logic would have to be implemented
				let compatibility =
					data[sourceName]?.[propertyName] &&
					typeof data[sourceName][propertyName] === "object" &&
					data[sourceName][propertyName].encodedImage &&
					data[sourceName][propertyName].corners;

				let compatibilityString = compatibility
					? "compatible"
					: "incompatible";

				correctDataArray.push(compatibilityString);
			} else if (propertyName.includes("3DPositions")) {
				let existence = data[sourceName][propertyName];

				if (!existence) continue;

				// This is where custom compatibility logic would have to be implemented
				let compatibility =
					data[sourceName]?.[propertyName] &&
					Array.isArray(data[sourceName][propertyName]);

				let compatibilityString = compatibility
					? "compatible"
					: "incompatible";

				correctDataArray.push(compatibilityString);
			} else {
				continue;
			}
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
	settingsMapper: settingsMapper,
	generalSettings: ["background"],
	dataValidator: dataValidator,
	renderFunction: renderComponent,
};

export default bundle;
