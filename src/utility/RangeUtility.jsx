// region Sources Data Object Getter

let getLimitedSourcesData = (sourcesData, lowerLimit, upperLimit) => {
	if (lowerLimit === "0" && upperLimit === "$MAX") return sourcesData;

	// region Limit Getting

	let limitToNumber = (limitString, maxValue, fallback) => {
		try {
			let replacedValue = limitString.replace(/\$MAX/g, maxValue);
			return eval(replacedValue);
		} catch {
			return fallback;
		}
	};

	// region Sources Data Object Manipulation

	let applyLimitsToSourcesData = (sourcesData, lowerLimit, upperLimit) => {
		return Object.fromEntries(
			Object.entries(sourcesData).map(([sourceKey, sourceData]) => {
				let filteredStream = sourceData?.ddStream?.slice(
					lowerLimit,
					upperLimit + 1
				);

				return [sourceKey, { ...sourceData, ddStream: filteredStream }];
			})
		);
	};

	// Calculation of what $MAX actually is for this Sources Data Object
	const currentMax = Math.max(
		...Object.values(sourcesData).map(
			(sourceData) => sourceData?.ddStream?.length || -Infinity
		)
	);

	let lowerLimitNumber = limitToNumber(lowerLimit, currentMax, -Infinity);
	let upperLimitNumber = limitToNumber(upperLimit, currentMax, Infinity);

	let limitedSourcesData = applyLimitsToSourcesData(
		sourcesData,
		lowerLimitNumber,
		upperLimitNumber
	);

	return limitedSourcesData;
};

export default getLimitedSourcesData;
