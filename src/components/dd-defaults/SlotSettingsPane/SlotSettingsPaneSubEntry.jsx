import ColorField from "./ColorField";

const SlotSettingsPaneSubEntry = ({
	entryName,
	subEntryName,
	excludable,
	excludedList,
	toggleExclude,
	slotSettings,
	modifySlotSettings,
}) => {
	// region Exclusion Logic

	const subEntryKey = `${entryName}/${subEntryName}`;
	const entryExcluded = excludedList.has(entryName);
	const subEntryExcluded = excludedList.has(subEntryKey);

	// region Rendering

	return (
		<div
			key={subEntryKey}
			className={`flex items-center space-x-4 ${
				entryExcluded || subEntryExcluded ? "opacity-50" : "opacity-100"
			}`}
		>
			{excludable && (
				<input
					type="checkbox"
					checked={!subEntryExcluded}
					onChange={() => toggleExclude(subEntryKey)}
					disabled={entryExcluded}
					className="accent-blue-500"
				/>
			)}

			<p className="overflow-auto">{subEntryName}</p>

			<ColorField
				subEntryKey={subEntryKey}
				slotSettings={slotSettings}
				modifySlotSettings={modifySlotSettings}
			/>
		</div>
	);
};

export default SlotSettingsPaneSubEntry;
