import { useState, useEffect } from "react";
import SlotSettingsPaneSubEntry from "./SlotSettingsPaneSubEntry";
import SlotSettingsPaneSubEntrySlider from "./SlotSettingsPaneSubEntrySlider";

const SlotSettingsPaneEntry = ({
	entryName,
	subEntries,
	excludable,
	slotSettings,
	modifySlotSettings,
}) => {
	// region Exclusion Logic

	const [excludedList, setExcluded] = useState(
		new Set(slotSettings?.exclude || [])
	);

	const entryExcluded = excludedList.has(entryName);

	useEffect(() => {
		setExcluded(new Set(slotSettings?.exclude || []));
	}, [slotSettings]);

	const toggleExclude = (item) => {
		const updatedExcluded = new Set(excludedList);
		if (updatedExcluded.has(item)) {
			updatedExcluded.delete(item);
		} else {
			updatedExcluded.add(item);
		}
		setExcluded(updatedExcluded);
		modifySlotSettings({
			...slotSettings,
			exclude: Array.from(updatedExcluded),
		});
	};

	// region Rendering

	return (
		<div
			key={entryName}
			className={`componentPanelElement p-4 border rounded ${
				entryExcluded ? "opacity-50" : "opacity-100"
			} bg-gray-500/40 border border-white/20 rounded-lg shadow-lg`}
		>
			<div className="flex items-center space-x-4">
				{excludable && (
					<input
						type="checkbox"
						checked={!entryExcluded}
						onChange={() => toggleExclude(entryName)}
						className="accent-blue-500"
					/>
				)}
				<p className="font-medium">{entryName}</p>
			</div>

			<div className="ml-8 flex flex-col space-y-2">
				{subEntries.map((subEntry) => {
					let subEntryName = subEntry;
					if (
						typeof subEntry === "object" &&
						subEntry?.name &&
						subEntry?.name?.length > 0
					) {
						subEntryName = subEntry.name;
					}

					return (
						<SlotSettingsPaneSubEntry
							key={`settings/${entryName}/${subEntryName}`}
							entryName={entryName}
							subEntryName={subEntryName}
							excludable={excludable}
							excludedList={excludedList}
							toggleExclude={toggleExclude}
							slotSettings={slotSettings}
							modifySlotSettings={modifySlotSettings}
						/>
					);
				})}

				{entryName === "general" && (
					<SlotSettingsPaneSubEntrySlider
						key={`settings/${"general"}/${"cooldown"}`}
						entryName={"general"}
						subEntryName={"cooldown"}
						slotSettings={slotSettings}
						modifySlotSettings={modifySlotSettings}
					/>
				)}
			</div>
		</div>
	);
};

export default SlotSettingsPaneEntry;
