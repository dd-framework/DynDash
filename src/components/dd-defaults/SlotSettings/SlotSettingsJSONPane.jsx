import React, { useState, useEffect } from "react";

const SlotSettingsJSONPane = ({ slotSettings, modifySlotSettings }) => {
	// region Input Handling

	const [isJsonValid, setIsJsonValid] = useState(true);
	const [editableSettings, setEditableSettings] = useState(
		slotSettings ? JSON.stringify(slotSettings, null, 2) : ""
	);

	// Update local state when slotSettings changes
	useEffect(() => {
		setEditableSettings(
			slotSettings ? JSON.stringify(slotSettings, null, 2) : ""
		);
		setIsJsonValid(true);
	}, [slotSettings]);

	// Update local state as the user types
	const handleTextareaChange = (e) => {
		let value = e.target?.value?.trim();
		value = value?.length === 0 ? "{}" : value;
		setEditableSettings(value);
	};

	const handleTextareaBlur = () => {
		try {
			const updatedSettings = JSON.parse(editableSettings);
			setIsJsonValid(true);
			modifySlotSettings(updatedSettings);
		} catch (error) {
			console.error("Invalid JSON in the Slot Settings!");
			setIsJsonValid(false);
		}
	};

	// Clipboard handlers
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(editableSettings);
		} catch (error) {
			console.error("Failed to copy!", error);
		}
	};

	const handlePaste = async () => {
		try {
			let text = await navigator.clipboard.readText();
			text = text?.trim();
			text = text?.length === 0 ? "{}" : text;
			setEditableSettings(text);
			try {
				const updatedSettings = JSON.parse(text);
				setIsJsonValid(true);
				modifySlotSettings(updatedSettings);
			} catch (error) {
				console.error("Invalid JSON in the Slot Settings!");
				setIsJsonValid(false);
			}
		} catch (error) {
			console.error("Failed to paste!", error);
		}
	};

	// region Rendering

	return (
		<div
			className={`relative w-full rounded font-mono backdrop-blur-lg rounded-lg shadow-lg ${
				isJsonValid ? "bg-gray-500/40" : "bg-red-500/40"
			}`}
		>
			<textarea
				className={`w-full h-full p-2 rounded font-mono text-white resize-none backdrop-blur-lg border border-white/20 rounded-lg shadow-lg ${
					isJsonValid ? "bg-gray-500/40" : "bg-red-500/40"
				}`}
				value={editableSettings}
				onChange={handleTextareaChange}
				onBlur={handleTextareaBlur}
			/>
			<div className="absolute p-1 top-0 right-0 flex space-x-0">
				<button
					onClick={handleCopy}
					className="px-3 py-1 text-sm font-medium bg-gray-500 text-white hover:bg-gray-700 focus:outline-none rounded-l-md"
				>
					Copy
				</button>
				<button
					onClick={handlePaste}
					className="px-3 py-1 text-sm font-medium bg-gray-500 text-white hover:bg-gray-700 focus:outline-none rounded-r-md"
				>
					Paste
				</button>
			</div>
		</div>
	);
};

export default SlotSettingsJSONPane;
