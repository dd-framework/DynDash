import React, { useEffect, useState } from "react";

const SlotSettingsPaneSubEntrySlider = ({
	entryName,
	subEntryName,
	slotSettings,
	modifySlotSettings,
}) => {
	// region State Logic

	const subEntryKey = `${entryName}/${subEntryName}`;

	const [cooldown, setCooldown] = useState(slotSettings?.cooldown || 0);

	useEffect(() => {
		setCooldown(slotSettings?.cooldown || 0);
	}, [slotSettings?.cooldown]);

	const updateCooldown = (newValue) => {
		let numericValue = parseInt(newValue, 10) || 0;
		if (newValue === "static") numericValue = "static";

		setCooldown(numericValue);

		modifySlotSettings({
			...slotSettings,
			cooldown: numericValue,
		});
	};

	// region Rendering

	return (
		<div
			key={subEntryKey}
			className="flex flex-col items-start rounded-lg bg-gray-800/50 p-2"
		>
			<div className="flex flex-row items-center w-full justify-between">
				<p className="overflow-auto">{subEntryName}</p>

				<input
					type="text"
					value={cooldown}
					onChange={(e) => updateCooldown(e.target.value)}
					className="w-16 text-center bg-gray-800/70 backdrop-blur-md border-none p-2 shadow-md"
				/>
			</div>

			<input
				type="range"
				min="0"
				max="100000"
				step="1000"
				value={cooldown === "static" ? 100000 : cooldown}
				onChange={(e) => {
					let value = e.target.value;
					value = value >= 100000 ? "static" : value;
					updateCooldown(value);
				}}
				className="w-full my-2"
			/>
		</div>
	);
};

export default SlotSettingsPaneSubEntrySlider;
