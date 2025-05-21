import React, { useState, useEffect } from "react";
import SidebarBox from "./SidebarBox";
import useRangeStore from "../../../stores/useRangeStore";
import useModalStore from "../../../stores/useModalStore";

const SidebarRangeBox = () => {
	// region State and Store Logic

	const startLimit = useRangeStore((state) => state.startLimit);
	const endLimit = useRangeStore((state) => state.endLimit);
	const setStartLimit = useRangeStore((state) => state.setStartLimit);
	const setEndLimit = useRangeStore((state) => state.setEndLimit);
	const getPresetNames = useRangeStore((state) => state.getPresetNames);
	const setToPreset = useRangeStore((state) => state.setToPreset);

	const customOptionPicker = useModalStore(
		(state) => state.customOptionPicker
	);

	let presetNames = getPresetNames();

	const [localStartValue, setLocalStartValue] = useState(startLimit);
	const [localEndValue, setLocalEndValue] = useState(endLimit);

	// Sync store values with local state when the store values change
	useEffect(() => {
		setLocalStartValue(startLimit);
	}, [startLimit]);

	useEffect(() => {
		setLocalEndValue(endLimit);
	}, [endLimit]);

	// region Event Handlers
	const handleStartChange = (value) => {
		setLocalStartValue(value);
		setStartLimit(value);
	};

	const handleEndChange = (value) => {
		setLocalEndValue(value);
		setEndLimit(value);
	};

	let titleOnClick = async (e) => {
		const chosenPreset = await customOptionPicker(
			"Set a Range of Data",
			`This Box allows to set a range, which will result in the Dashboard only showing data points whose "name" key falls within the specified range. Custom Ranges can be added in the dd_config.json file.`,
			presetNames
		);

		if (chosenPreset) setToPreset(chosenPreset);
	};

	// region Rendering

	// if (!gridMode) return null;

	// Content for SidebarBox
	const content = (
		<div className="flex items-center gap-4">
			{/* Start Value Input */}
			<div className="flex-1">
				<label className="sr-only" htmlFor="startValue">
					Start Value
				</label>
				<input
					id="startValue"
					type="text"
					value={localStartValue || ""}
					onChange={(e) => handleStartChange(e.target.value)}
					placeholder="Start"
					className="w-full text-center bg-gray-800/70 backdrop-blur-md border-none p-2 shadow-md text-white rounded-lg"
				/>
			</div>

			{/* End Value Input */}
			<div className="flex-1">
				<label className="sr-only" htmlFor="endValue">
					End Value
				</label>
				<input
					id="endValue"
					type="text"
					value={localEndValue || ""}
					onChange={(e) => handleEndChange(e.target.value)}
					placeholder="End"
					className="w-full text-center bg-gray-800/70 backdrop-blur-md border-none p-2 shadow-md text-white rounded-lg"
				/>
			</div>
		</div>
	);

	return (
		<SidebarBox
			title="Range Settings"
			onClick={titleOnClick}
			content={content}
		/>
	);
};

export default SidebarRangeBox;
