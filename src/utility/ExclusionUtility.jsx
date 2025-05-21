// This function filters out any data from "sources" that was explicity excluded by the "slotSettings"

let removeSourceDataExclusions = (inputSourcesData, slotSettings) => {
	let includedData = inputSourcesData;
	if (!inputSourcesData || !slotSettings) return includedData;

	if (slotSettings?.exclude) {
		includedData = Object.fromEntries(
			Object.entries(includedData).filter(
				([key]) => !slotSettings.exclude.includes(key)
			)
		);
	}

	return includedData;
};

export default removeSourceDataExclusions;
