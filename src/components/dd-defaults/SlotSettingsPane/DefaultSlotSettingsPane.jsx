import SlotSettingsPaneEntry from "./SlotSettingsPaneEntry";

const DefaultSlotSettingsPane = ({
	componentName,
	generalSettings,
	sourcesData,
	slotSettings,
	modifySlotSettings,
	settingsMapper,
}) => {
	// region Rendering
	return (
		<div className="backdrop-blur-lg bg-gray-500/40 border border-white/20 rounded-lg shadow-lg text-white p-4 overflow-scroll h-full w-full">
			<p className="text-lg font-bold mb-4">{`${componentName} Settings:`}</p>
			<div className="componentPanel grid gap-4 w-full">
				<SlotSettingsPaneEntry
					entryName={"general"}
					subEntries={generalSettings}
					excludable={false}
					slotSettings={slotSettings}
					modifySlotSettings={modifySlotSettings}
				/>

				{/* Mapping the Object Entries onto Sub Entries */}
				{Object.entries(sourcesData).map(([sourceName, sourceData]) => {
					let subEntries = [];

					// If it's a source with stream data
					if (sourceData.ddStream) {
						const subSources = Object.keys(
							sourceData.ddStream[0] || {}
						).filter((key) => key !== "name");
						subEntries = subEntries.concat(subSources);
					}

					// If it's a source with url data
					if (sourceData.ddURL) {
						const subURL = Object.keys(sourceData.ddURL) || [];
						subEntries = subEntries.concat(subURL);
					}

					// If it's a source with status data
					if (sourceData.ddStatus) {
						const subStatus =
							Object.keys(sourceData.ddStatus) || [];
						subEntries = subEntries.concat(subStatus);
					}

					if (settingsMapper) {
						try {
							let mappedEntries = settingsMapper(sourceData);
							if (mappedEntries?.length > 0) {
								subEntries = subEntries.concat(mappedEntries);
							}
						} catch (error) {
							console.log(
								"An error occurred while trying to generate a customized Settings Pane",
								error
							);
						}
					}

					return (
						<SlotSettingsPaneEntry
							key={`settings/${sourceName}`}
							entryName={sourceName}
							subEntries={subEntries}
							excludable={true}
							slotSettings={slotSettings}
							modifySlotSettings={modifySlotSettings}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default DefaultSlotSettingsPane;
