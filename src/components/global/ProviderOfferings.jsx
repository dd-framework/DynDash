const ProviderOfferings = ({ offeringsMap, keyPrefix }) => {
	let returnArray = [];

	Object.keys(offeringsMap).forEach((offering) => {
		let value = offeringsMap[offering];

		returnArray.push(
			<p
				key={`${keyPrefix}-${offering}`}
				className={`bg-gray-500 px-1 rounded-lg text-sm ${
					value ? "opacity-100" : "opacity-50"
				}`}
			>
				{offering}
			</p>
		);
	});

	return <span className="flex space-x-2 items-center">{returnArray}</span>;
};

export default ProviderOfferings;
