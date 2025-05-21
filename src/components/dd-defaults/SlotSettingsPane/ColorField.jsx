import { useState, useEffect } from "react";
import useColorStore from "../../../stores/useColorStore";

const ColorField = ({ subEntryKey, slotSettings, modifySlotSettings }) => {
	const setAnchorPosition = useColorStore((state) => state.setAnchorPosition);
	const setAnchorMutation = useColorStore((state) => state.setAnchorMutation);
	const setAnchorInitialColor = useColorStore(
		(state) => state.setAnchorInitialColor
	);
	const setShowColorPicker = useColorStore(
		(state) => state.setShowColorPicker
	);
	const showColorPicker = useColorStore((state) => state.showColorPicker);

	// region Color State Logic
	const [colors, setColors] = useState(slotSettings?.colors || {});
	const getColor = (item) => colors[item] || "#FFFFFF";
	const itemColor = getColor(subEntryKey);

	useEffect(() => {
		setColors(slotSettings?.colors || {});
	}, [slotSettings]);

	const updateColor = (item, color) => {
		const updatedColors = { ...colors, [item]: color };
		setColors(updatedColors);
		modifySlotSettings({
			...slotSettings,
			colors: updatedColors,
		});
	};

	const updateColorWrapped = (color) => updateColor(subEntryKey, color);

	const removeColor = (item) => {
		const updatedColors = { ...colors };
		delete updatedColors[item];
		setColors(updatedColors);
		modifySlotSettings({
			...slotSettings,
			colors: updatedColors,
		});
	};

	// region Rendering

	return (
		<>
			<div className="relative" style={{ anchorName: subEntryKey }}>
				<div
					className="h-6 w-6 rounded cursor-pointer border"
					style={{
						backgroundColor: itemColor,
					}}
					onClick={(e) => {
						e.stopPropagation();

						setShowColorPicker(
							subEntryKey === showColorPicker ? null : subEntryKey
						);

						setAnchorMutation(updateColorWrapped);
						setAnchorInitialColor(itemColor);

						let rect = e.target.getBoundingClientRect();
						setAnchorPosition({
							top: rect.top + window.scrollY,
							left: rect.left + window.scrollX,
						});
					}}
				/>
			</div>

			{/* Color Removal Button */}
			{colors[subEntryKey] && (
				<button
					onClick={() => removeColor(subEntryKey)}
					className="bg-red-500 text-white text-xs px-2 py-1 rounded"
				>
					&times;
				</button>
			)}
		</>
	);
};

export default ColorField;
