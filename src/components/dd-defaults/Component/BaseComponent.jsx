import { createPortal } from "react-dom";
import React, { useState, useEffect, useRef } from "react";
import DataTypeRibbon from "../../global/DataTypeRibbon";
import SlotSourcesList from "../Slot/SlotSourcesList";
import useDataStore from "../../../stores/useDataStore";
import useRangeStore from "../../../stores/useRangeStore";
import getLimitedSourcesData from "../../../utility/RangeUtility";
import removeSourceDataExclusions from "../../../utility/ExclusionUtility";

const BaseComponent = ({
	uuid,
	componentName,
	componentIcon,
	SettingsPane,
	settingsMapper,
	dataValidator,
	dataProcessor,
	renderComponent,

	generalSettings,
	sourcesList,
	sourcesRemoval,
	renderType,
	slotSettings,
	modifySlotSettings,
	dataTypes,
	bypassEmpty,
}) => {
	// region Data Getting

	let getDataFromSources = useDataStore((state) => state.getDataFromSources);

	let startLimit = useRangeStore((state) => state.startLimit);
	let endLimit = useRangeStore((state) => state.endLimit);

	const [sourcesData, setSourcesData] = useState({});
	const [renderData, setRenderData] = useState({});
	const [validityArray, setValidityArray] = useState([]);
	const [noSourcesData, setNoSourcesData] = useState([]);

	// The ref holds the timestamp until which updates are suppressed
	const nextAllowedTimeRef = useRef(0);
	const hasReceivedDataRef = useRef(false);

	useEffect(() => {
		let slotSources = sourcesList;

		let populateLocalState = () => {
			let isStatic = slotSettings?.cooldown === "static";
			let hasReceivedData = hasReceivedDataRef.current;

			if (isStatic && hasReceivedData) {
				return;
			}

			if (slotSettings?.cooldown > 0) {
				const now = Date.now();

				// If the function gets called while still in the cooldown period, skip
				if (now < nextAllowedTimeRef.current) {
					return;
				}

				// After the cooldown has elapsed, reset the next allowed update time
				nextAllowedTimeRef.current = now + slotSettings.cooldown;
			}

			let newData = getDataFromSources(slotSources);

			// Create the worker code as a string.
			const workerCode = `
  // Include the functions by converting them to string.
  const getLimitedSourcesData = ${getLimitedSourcesData.toString()};
  const removeSourceDataExclusions = ${removeSourceDataExclusions.toString()};
  const dataValidator = ${dataValidator.toString()};
  ${dataProcessor ? `const dataProcessor = ${dataProcessor.toString()};` : ""}
  
  self.onmessage = function(e) {
	const { newData, startLimit, endLimit, slotSettings } = e.data;
	const limitedData = getLimitedSourcesData(newData, startLimit, endLimit);
	const includedSourcesData = removeSourceDataExclusions(limitedData, slotSettings);
	const validity = dataValidator(includedSourcesData);
	const finalData = (typeof dataProcessor === 'function')
	  ? dataProcessor(includedSourcesData, slotSettings)
	  : includedSourcesData;
	// Return the computed data.
	self.postMessage({
	  limitedData,
	  includedSourcesData,
	  validity,
	  finalData,
	  hasReceivedData: Object.keys(limitedData).length > 0,
	});
  };
`;

			// Create a Blob from the code.
			const blob = new Blob([workerCode], {
				type: "application/javascript",
			});
			const worker = new Worker(URL.createObjectURL(blob));

			// Post the data needed for computation.
			worker.postMessage({ newData, startLimit, endLimit, slotSettings });

			worker.onmessage = (e) => {
				const {
					limitedData,
					includedSourcesData,
					validity,
					finalData,
					hasReceivedData,
				} = e.data;
				// Update state in the main thread.
				setNoSourcesData(Object.keys(includedSourcesData).length === 0);
				setValidityArray(validity);
				setSourcesData(limitedData);
				setRenderData(finalData);
				hasReceivedDataRef.current = hasReceivedData;
				// Clean up the worker.
				worker.terminate();
			};
		};

		let unsubscribers = slotSources?.map((sourceKey) => {
			return useDataStore.subscribe(
				(state) => state[sourceKey],
				() => {
					populateLocalState();
				}
			);
		});

		populateLocalState();

		return () => {
			unsubscribers?.forEach((unsub) => unsub());
		};
	}, [
		sourcesList,
		slotSettings,
		getDataFromSources,
		startLimit,
		endLimit,
		dataValidator,
		dataProcessor,
	]);

	// region Sidebar Logic

	// If the dd-Component is rendered in the sidebar of the application, only give back the most simple representation of what this dd-Component represents
	// This should not use any information that can change with store updates, as it is supposed merely represent the general idea of the dd-Component
	// The logic for sidebar rendering is located at the top of the file and not in the "Rendering Logic" region in order to prevent running the data logic for it
	if (renderType === "sidebar") {
		return (
			<div className="flex items-center space-x-2">
				{componentIcon}
				<p>{componentName}</p>
			</div>
		);
	}

	// region Rendering Functions

	let awaitingColor = "bg-yellow-300/30 backdrop-blur-md";
	let warningColor = "bg-orange-400/30 backdrop-blur-md";
	let errorColor = "bg-red-500/30 backdrop-blur-md";

	// Rendering Function that will be used to creatae a Placeholder for the dd-Component, should a full render be impossible or unnecessary
	let renderPlaceholder = (additionalClasses, message, optionalBody) => {
		let isPreview = renderType === "preview";

		message = isPreview ? null : message;

		let showRibbon = !isPreview && dataTypes?.length >= 0;

		let className = `${additionalClasses} select-none text-white rounded-lg text-sm border border-gray-600 flex flex-col items-center justify-center text-center space-x-2 space-y-4 w-full h-full`;

		return (
			<>
				<div className={className}>
					<div className="flex items-center justify-center text-center space-x-2">
						{componentIcon}
						{message && <span>{message}</span>}
					</div>

					{!isPreview && optionalBody}
				</div>

				{showRibbon && (
					<DataTypeRibbon
						dataTypes={dataTypes}
						additionalClasses={"absolute top-2 right-2"}
						keyContext={`${uuid}-${componentName}`}
					/>
				)}

				{renderSettingsPane()}
			</>
		);
	};

	// Rendering Function that will be used to creatae the associated Settings Pane for the dd-Component,
	// which will be rendered conditionally and injected into a different part of the Application
	let renderSettingsPane = () => {
		let parent = document.getElementById("slot-settings-detail");
		return (
			renderType === "settings" &&
			parent &&
			createPortal(
				<SettingsPane
					componentName={componentName}
					generalSettings={generalSettings}
					sourcesData={sourcesData}
					slotSettings={slotSettings}
					modifySlotSettings={modifySlotSettings}
					settingsMapper={settingsMapper}
				/>,
				parent
			)
		);
	};

	// region Data Processing

	// This region is used to actually make use of the functions provided in the "Data Processing Functions" region, in order to filter out unwanted/incompatible data from the sources

	let incompatibleSources = validityArray?.length > 0;

	// Display an informative placeholder,
	// - If there is no data left at all
	// - If the data is in a format this component cannot evaluate
	if ((noSourcesData && !bypassEmpty) || incompatibleSources) {
		let placeholderContent = {
			empty: {
				color: awaitingColor,
				message: `${componentName} is awaiting data`,
				body: undefined,
			},
			incompatible: {
				color: warningColor,
				message: `${componentName} has incompatible data`,
				body: (
					<div className="max-w-fit w-[80%]">
						<SlotSourcesList
							title={"Incompatible Sources:"}
							sources={validityArray}
							removal={sourcesRemoval}
							staticComponent={componentName}
							staticSources={sourcesList}
							staticTypesList={dataTypes}
						/>
					</div>
				),
			},
		};

		let reason = noSourcesData ? "empty" : "incompatible";

		return renderPlaceholder(
			placeholderContent[reason].color,
			placeholderContent[reason].message,
			placeholderContent[reason].body
		);
	}

	// region Rendering Logic
	// MODIFY-NONE

	// If the dd-Component is rendered in a preview view, display a simplified version of it without an additional message
	if (renderType === "preview") {
		return renderPlaceholder("bg-gray-100/50 backdrop-blur-md", null);
	}

	// Otherwise, try rendering the whole thing along its settings pane
	try {
		return (
			<div className="w-full h-full">
				{renderComponent(uuid, renderData, slotSettings)}
				{renderSettingsPane()}
			</div>
		);
	} catch (e) {
		// In case there are any errors, render the error placeholder of the dd-Component
		return renderPlaceholder(
			errorColor,
			`${componentName} threw an error: ${e.message}`
		);
	}
};

export default BaseComponent;
