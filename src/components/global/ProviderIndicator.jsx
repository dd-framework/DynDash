import React, { useState } from "react";
import useProviderStore from "../../stores/useProviderStore";
import useModalStore from "../../stores/useModalStore";
import ProviderOfferings from "./ProviderOfferings";

const ProviderIndicator = ({ provider, additionalClasses }) => {
	// region Store and State Logic

	const customConfirm = useModalStore((state) => state.customConfirm);
	const getProviderRegistrations = useProviderStore(
		(state) => state.getProviderRegistrations
	);
	const providerObject = useProviderStore(
		(state) => state.providers[provider]
	);

	const [imgError, setImgError] = useState(false);

	// region Event Handlers

	let renderedIcon = !imgError ? (
		<img
			src={`${provider}/icon`}
			alt="Origin Icon"
			onError={() => setImgError(true)}
			className="w-full h-full object-contain"
		/>
	) : (
		<span className="text-center w-full text-white font-bold text-xs">
			?
		</span>
	);

	let clickFunction = async (e) => {
		e.stopPropagation();
		await customConfirm(
			<span className="flex flex-row space-x-2 items-center">
				<p>{`Provider: `}</p>
				<span className="bg-gray-600 px-2 rounded-lg flex flex-row space-x-2 items-center">
					<div className="flex items-center justify-center rounded-full bg-gray-800/70 border border-white/20 p-1 w-7 h-7">
						{renderedIcon}
					</div>
					<p>{`${providerObject.name}`}</p>
				</span>
			</span>,
			<span className="space-y-4">
				<span className="space-y-2">
					<span className="flex space-x-2 w-[95%] justify-between">
						<p>Registered for:</p>
						<ProviderOfferings
							offeringsMap={getProviderRegistrations(provider)}
							keyPrefix={"registered-as"}
						/>
					</span>
					<span className="flex space-x-2 w-[95%] justify-between">
						<p>Claims to serve:</p>
						<ProviderOfferings
							offeringsMap={providerObject.provides}
							keyPrefix={"claims-to-serve"}
						/>
					</span>
					<span className="flex space-x-2">
						<p>Registered under:</p>
						<a className="text-gray-400 italic" href={provider}>
							{provider}
						</a>
					</span>
				</span>
				<hr className="h-px bg-gray-300" />
				<p>{providerObject.info}</p>
			</span>
		);
	};

	// region Rendering

	if (!provider) return null;

	return (
		<div
			className={`${additionalClasses} flex items-center justify-center bg-gray-800/70 border border-white/20 p-1 w-7 h-7`}
			onClick={clickFunction}
		>
			{renderedIcon}
		</div>
	);
};

export default ProviderIndicator;
