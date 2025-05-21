import React, { Suspense } from "react";
import useModalStore from "../../../stores/useModalStore";
import DataTypeRibbon from "../DataTypeRibbon";
import ProviderIndicator from "../ProviderIndicator";
import SideLabel from "../SideLabel";
import BaseComponentLean from "../../dd-defaults/Component/BaseComponentLean";
import useProviderStore from "../../../stores/useProviderStore";
import useInterfaceStore from "../../../stores/useInterfaceStore";

const SidebarListElement = ({
	name,
	displayName,
	information,
	explanation,
	dataTypes,
	sidebarElementType,
	icon,
}) => {
	const customConfirm = useModalStore((state) => state.customConfirm);
	const infoMode = useInterfaceStore((state) => state.infoMode);
	const getProviderOfElement = useProviderStore(
		(state) => state.getProviderOfElement
	);

	displayName = displayName || name;

	let provider = getProviderOfElement(name, `${sidebarElementType}sList`);

	// TODO find a better way to do this
	// This is unclean code that is not discarded because it currently enables the subscription to the store in one line.
	const providers = useProviderStore((state) => state.providers);
	if (providers && false) console.log("Providers used!");

	// region Icons

	// HEROICONS question-mark-circle
	let showIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
			/>
		</svg>
	);

	let elementOnClick = async (e) => {
		e.stopPropagation();

		await customConfirm(
			<span className="flex flex-row space-x-2 items-center">
				<p>{displayName}</p>
				<span className="bg-gray-600 px-2 rounded-lg flex flex-row space-x-2 items-center">
					<p>{`${name}`}</p>
				</span>
			</span>,
			explanation,
			{
				widthSettings: "w-[50%] max-w-[60%]",
			}
		);
	};

	// region Rendering
	if (!name) {
		return <p>Element Loading Error</p>;
	}

	if (sidebarElementType === "source") {
		return (
			<>
				<div className="relative" onClick={elementOnClick}>
					<p data-sidebar-source-name={name}>{displayName}</p>
					<p className="text-xs text-white/50">{information}</p>
					<DataTypeRibbon
						dataTypes={dataTypes}
						additionalClasses={"absolute top-0 right-0"}
						keyContext={`sidebar-source-${name}`}
					/>
				</div>
				{infoMode && provider && (
					<SideLabel
						content={
							<ProviderIndicator
								provider={provider}
								additionalClasses={"rounded-l-full"}
							/>
						}
						side={"l"}
					/>
				)}
			</>
		);
	}

	return (
		<>
			<div
				className="relative"
				data-sidebar-component-name={name}
				onClick={elementOnClick}
			>
				<Suspense
					fallback={
						<div className="flex items-center space-x-2">
							{showIcon}
							<p>{displayName}</p>
						</div>
					}
				>
					<BaseComponentLean
						componentName={displayName}
						componentIcon={icon}
						renderType={"sidebar"}
						dataTypes={dataTypes}
					/>
					<p className="text-xs text-white/50">{information}</p>
				</Suspense>
			</div>
			{infoMode && provider && (
				<SideLabel
					content={
						<ProviderIndicator
							provider={provider}
							additionalClasses={"rounded-l-full"}
						/>
					}
					side={"l"}
				/>
			)}
		</>
	);
};

export default SidebarListElement;
