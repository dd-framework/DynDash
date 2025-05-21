import React, { useState, useEffect, useRef } from "react";
import useBoardStore from "../../../stores/useBoardStore";
import useComponentStore from "../../../stores/useComponentStore";
import useInterfaceStore from "../../../stores/useInterfaceStore";
import useAlertStore from "../../../stores/useAlertStore";
import SlotSettingsScreen from "../../global/SlotSettingsScreen";
import SlotName from "./SlotName";
import SlotDeleteButton from "./SlotDeleteButton";
import SlotResizeButtons from "./SlotResizeButtons";
import SlotResizeHandle from "./SlotResizeHandle";
import ComponentLoader from "../Component/ComponentLoader";
import SlotSourcesList from "./SlotSourcesList";
import SlotComponentsList from "./SlotComponentsList";
import SlotSettingsDragElement from "./SlotSettingsDragElement";
import SlotSettingsMissingPane from "../SlotSettings/SlotSettingsMissingPane";
import SlotSettingsPaneContainer from "../SlotSettings/SlotSettingsPaneContainer";
import SlotSettingsJSONPane from "../SlotSettings/SlotSettingsJSONPane";
import ShowSlotSettingsJSONPaneButton from "../SlotSettings/ShowSlotSettingsJSONPaneButton";

const Slot = ({ providerName, folderName, fileName, uuid, renderType }) => {
	// region Utility
	const infoMode = useInterfaceStore((state) => state.infoMode);
	const gridMode = useBoardStore((state) => state.gridMode);
	const toolMode = useBoardStore((state) => state.toolMode);
	const slotSelection = useBoardStore((state) => state.slotSelection);
	const updateSlotData = useBoardStore((state) => state.updateSlotData);
	const getSlot = useBoardStore((state) => state.getSlot);
	const deleteSlot = useBoardStore((state) => state.deleteSlot);
	const setDragging = useBoardStore((state) => state.setDragging);
	const setDragOffset = useBoardStore((state) => state.setDragOffset);
	const setDragArea = useBoardStore((state) => state.setDragArea);
	const setDragSlotInfo = useBoardStore((state) => state.setDragSlotInfo);
	const dragSlotInfo = useBoardStore((state) => state.dragSlotInfo);
	const dragSidebarData = useBoardStore((state) => state.dragSidebarData);
	const dragSettingsData = useBoardStore((state) => state.dragSettingsData);
	const setAlert = useAlertStore((state) => state.setAlert);
	const alertHover = useAlertStore((state) => state.alertHover);
	const getComponentsListWithInformation = useComponentStore(
		(state) => state.getComponentsListWithInformation
	);
	const setSettingsViewActive = useBoardStore(
		(state) => state.setSettingsViewActive
	);
	const setActiveSlotDataTypes = useBoardStore(
		(state) => state.setActiveSlotDataTypes
	);
	const setActiveSlotSources = useBoardStore(
		(state) => state.setActiveSlotSources
	);
	const setActiveSlotComponent = useBoardStore(
		(state) => state.setActiveSlotComponent
	);

	const slotSelectionDragOver = useBoardStore(
		(state) => state.slotSelectionDragOver
	);

	const setSlotSelectionDragOver = useBoardStore(
		(state) => state.setSlotSelectionDragOver
	);

	let grid = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.data?.grid
	);

	const slotData = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.data?.slots[
				uuid
			]
	);

	const modifySlotSettings = (updatedSettings) => {
		updateSlotData(providerName, folderName, fileName, uuid, {
			settings: updatedSettings,
		});
	};

	let componentName = slotData?.component;
	let slotSettings = slotData?.settings;
	let slotSourcesList = slotData?.sources || [];
	let slotDataTypes = [];

	try {
		let storedTypes = getComponentsListWithInformation([
			componentName,
		])[0]?.dataTypes?.flat(Infinity);

		if (storedTypes && Array.isArray(storedTypes)) {
			slotDataTypes = storedTypes;
		}

		for (let i = 0; i < slotDataTypes?.length; i++) {
			slotDataTypes[i] = slotDataTypes[i].replaceAll("*", "");
		}
	} catch {}

	const [showSettings, setShowSettings] = useState(false);
	const [textareaVisible, setTextareaVisible] = useState(true);
	const [draggingOver, setDraggingOver] = useState(false);
	const [mouseDown, setMouseDown] = useState(false);
	const [altDown, setAltDown] = useState(false);

	const ref = useRef();

	useEffect(() => {
		const handleAlert = async (event) => {
			console.log("Alert received from Component", event?.detail);
			let alertObject = {
				title: event?.detail?.title,
				text: event?.detail?.text,
				seen: false,
				slot: uuid,
				uuid: crypto.randomUUID(),
				urgency: event?.detail?.urgency,
			};
			setAlert(providerName, folderName, fileName, alertObject);
		};

		let node = ref.current;
		node.addEventListener("ddAlert", handleAlert);

		// Cleanup on unmount
		return () => {
			node.removeEventListener("ddAlert", handleAlert);
		};
	}, [fileName, folderName, providerName, setAlert, uuid, showSettings]);

	if (!slotData) return;

	// region Event Handlers

	const handleDrop = (e) => {
		e.preventDefault();
		if (slotSelection.includes(uuid)) setSlotSelectionDragOver(false);
		setDraggingOver(false);
		setAltDown(false);
		const droppedItem = e.dataTransfer.getData("text");
		const type = e.dataTransfer.getData("type");

		let slotsToCover = [uuid];
		if (slotSelection.includes(uuid)) {
			slotsToCover = slotSelection;
		}

		for (let i = 0; i < slotsToCover.length; i++) {
			let uuid = slotsToCover[i];
			let noSelection = slotsToCover.length === 1;
			let loopSlotData = noSelection
				? slotData
				: getSlot(providerName, folderName, fileName, uuid);

			if (type === "source") {
				let newSources = [...(loopSlotData.sources || [])];

				if (newSources.includes(droppedItem)) {
					newSources = newSources.filter(
						(source) => source !== droppedItem
					);
				} else {
					newSources.push(droppedItem);
				}

				updateSlotData(providerName, folderName, fileName, uuid, {
					sources: newSources,
				});

				if (noSelection && showSettings) {
					setActiveSlotSources(newSources);
				}
			} else if (type === "component") {
				let CurrentComponent = loopSlotData?.component;
				let newComponent =
					CurrentComponent === droppedItem ? undefined : droppedItem;

				updateSlotData(providerName, folderName, fileName, uuid, {
					component: newComponent,
				});

				if (noSelection && showSettings) {
					setActiveSlotComponent(newComponent);
				}
			} else if (type === "settings") {
				let insertSettings = dragSettingsData;

				if (e?.altKey) {
					insertSettings = {
						...loopSlotData?.settings,
						...insertSettings,
					};
				}

				updateSlotData(providerName, folderName, fileName, uuid, {
					settings: insertSettings,
				});
			}
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		if (dragSlotInfo) return; // Slot dragging should not trigger overlay
		if (slotSelection.includes(uuid)) setSlotSelectionDragOver(true);
		setDraggingOver(true);
		setAltDown(e.altKey);
	};

	const handleDragLeave = (e) => {
		if (dragSlotInfo) return; // Slot dragging should not trigger overlay
		if (slotSelection.includes(uuid)) setSlotSelectionDragOver(false);
		setDraggingOver(false);
		setAltDown(false);
	};

	const handleClick = (e) => {
		e.preventDefault();
		if (toolMode) return;
		setShowSettings(true);
		setActiveSlotSources(slotSourcesList);
		setActiveSlotComponent(componentName);
		setActiveSlotDataTypes(slotDataTypes);
		setSettingsViewActive(true);
		setMouseDown(false);
	};

	const handleCloseSettings = () => {
		setShowSettings(false);
		setActiveSlotDataTypes(null);
		setActiveSlotSources(null);
		setActiveSlotComponent(null);
		setSettingsViewActive(false);
	};

	const handleMouseEnter = () => {
		if (showSettings) return;
		setActiveSlotSources(slotSourcesList);
		setActiveSlotComponent(componentName);
		setActiveSlotDataTypes(slotDataTypes);
	};

	const handleMouseLeave = () => {
		if (showSettings) return;
		setActiveSlotDataTypes(null);
		setActiveSlotSources(null);
		setActiveSlotComponent(null);
	};

	const handleDragStart = (e) => {
		let efps;
		let efp;
		for (let i = 0; i < 5; i++) {
			efps = document.elementsFromPoint(
				e.clientX - i * grid.gaps,
				e.clientY - i * grid.gaps
			);
			efp = efps.find((element) => {
				return Object.values(element.classList).includes("cell");
			});
			if (efp) break;
		}

		let areaData = [...slotData.area];
		let offset = {
			rowOffset: parseInt(areaData[0]) - efp.style["grid-row-start"],
			colOffset: parseInt(areaData[1]) - efp.style["grid-column-start"],
		};
		setDragging("slot");
		setDragOffset(offset);
		setDragArea([...slotData.area]);
		setDragSlotInfo({ providerName, folderName, fileName, uuid });
	};

	const handleDragEnd = (e) => {
		setDragging(null);
		setDragOffset(null);
		setDragArea(null);
		setDragSlotInfo(null);
		setMouseDown(false);
	};

	const removeSource = (sourceName) => {
		let newSources = slotData.sources || [];

		if (newSources.includes(sourceName)) {
			newSources = newSources.filter((source) => source !== sourceName);
		}

		updateSlotData(providerName, folderName, fileName, uuid, {
			sources: newSources,
		});

		if (showSettings) {
			setActiveSlotSources(newSources);
		}
	};

	const removeComponent = (componentName) => {
		if (slotData?.component === componentName) {
			updateSlotData(providerName, folderName, fileName, uuid, {
				component: null,
			});

			if (showSettings) {
				setActiveSlotComponent(null);
			}
		}
	};

	const removeSettings = () => {
		modifySlotSettings(null);
	};

	// region Rendering Functions

	// Generate a bare-bones Slot that displays the given slotContent and fills up the dedicated area
	const getDefaultSlot = (slotContent) => {
		let areaData = [...slotData.area];
		areaData[0] = Math.min(parseInt(areaData[0]), parseInt(grid.rows));
		areaData[1] = Math.min(parseInt(areaData[1]), parseInt(grid.columns));
		areaData[2] = Math.min(parseInt(areaData[2]), parseInt(grid.rows) + 1);
		areaData[3] = Math.min(
			parseInt(areaData[3]),
			parseInt(grid.columns) + 1
		);
		let calculatedArea = areaData.join(" / ");

		let coloring = showSettings
			? "bg-gradient-to-br from-gray-300/15 to-gray-400/30"
			: "bg-gradient-to-br from-gray-800/40 to-gray-900/80";

		// Drag Compatibility and Presence calculations

		let isCompatibleElement = undefined;
		let isPresentElement = undefined;

		if (dragSidebarData) {
			let slotComponent = componentName;
			let slotSources = slotSourcesList;

			let arrayOverlap = (array1, array2) => {
				const set = new Set(array1);
				return array2?.some((item) => set.has(item));
			};

			let isCompatibleSource =
				!slotDataTypes ||
				arrayOverlap(dragSidebarData?.dataTypes, slotDataTypes);

			// Components are always Compatible with Slots
			isCompatibleElement =
				isCompatibleSource ||
				dragSidebarData?.elementType === "component";

			isPresentElement =
				dragSidebarData?.elementType === "component"
					? slotComponent === dragSidebarData?.name
					: slotSources?.includes(dragSidebarData?.name);
		} else if (dragSettingsData) {
			isCompatibleElement = true;
			isPresentElement = false;
		}

		// Setting the overlay color in accordance with the current dragging behaviour

		let overlayColor = "border-white/0 bg-white/0";

		// Slot is Included in Selection
		if (slotSelection.includes(uuid)) {
			overlayColor = "border-purple-700/80 bg-purple-500/40";

			// Selection is being dragged over while Slot is part of that selection
			// (However, the Slot is probably not the currently dragged-over Slot)
			if (slotSelectionDragOver) {
				overlayColor = isCompatibleElement
					? "border-green-700/80 bg-green-500/40"
					: "border-red-700/80 bg-red-500/40";
			}
		}

		// Slot is being dragged over directly
		if (draggingOver) {
			overlayColor = isCompatibleElement
				? "border-green-700/80 bg-green-500/40"
				: "border-red-700/80 bg-red-500/40";
		}

		// Setting animations and styling for various Tool Modes

		let wiggle = toolMode === "move" && !mouseDown;
		let wiggleAnimation = wiggle ? "animate-wiggle" : "";

		let isResize = toolMode === "resize";
		let isAlertHover = alertHover === uuid;

		let borderStyling = "";
		if (isResize) {
			borderStyling =
				"border-r-4 border-b-4 border-solid animate-border-cycle";
		}
		if (isAlertHover) {
			borderStyling = "border-4 border-solid border-red-500";
		}

		return (
			<div
				className={`group relative w-full h-full z-[4] ${borderStyling} ${wiggleAnimation} ${coloring} backdrop-blur-md shadow-[inset_0_10px_16px_rgba(0,0,0,0.3),inset_0_4px_6px_rgba(255,255,255,0.08),0_3px_6px_rgba(0,0,0,0.25)] rounded-lg ring-2 ring-inset ring-gray-700/25`}
				style={{
					gridArea: calculatedArea,
				}}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onClick={renderType === "detail" ? handleClick : null}
				draggable={
					renderType === "detail" &&
					toolMode === "move" &&
					gridMode &&
					!showSettings
				}
				onMouseDown={(e) => {
					setMouseDown(true);
				}}
				onMouseUp={(e) => {
					setMouseDown(false);
				}}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				id={`${folderName}/${fileName}-${uuid}`}
				ref={ref}
			>
				{/* Slot Manipulation Controls */}
				{gridMode && toolMode === "resize" && (
					<>
						<SlotDeleteButton
							onClick={() =>
								deleteSlot(
									providerName,
									folderName,
									fileName,
									uuid
								)
							}
						/>
						{showSettings && (
							<>
								<SlotResizeButtons
									providerName={providerName}
									folderName={folderName}
									fileName={fileName}
									uuid={uuid}
									orientation="vertical"
								/>
								<SlotResizeButtons
									providerName={providerName}
									folderName={folderName}
									fileName={fileName}
									uuid={uuid}
									orientation="horizontal"
								/>
							</>
						)}
						{!showSettings && (
							<SlotResizeHandle
								providerName={providerName}
								folderName={folderName}
								fileName={fileName}
								uuid={uuid}
								mouseDownState={setMouseDown}
							/>
						)}
					</>
				)}

				{/* Slot Interaction Overlay */}
				{(draggingOver || slotSelection.includes(uuid)) && (
					<div
						className={`absolute w-full h-full overflow-scroll z-[5] border-4 ${overlayColor} rounded-lg flex items-center justify-center text-center text-7xl font-bold ${
							toolMode ? "pointer-events-none" : ""
						}`}
					>
						{(dragSidebarData || dragSettingsData) &&
							(draggingOver || slotSelectionDragOver) && (
								<div className="flex flex-col">
									<p>{isPresentElement ? "-" : "+"}</p>
									{altDown && dragSettingsData ? (
										<p className="text-lg">(combine)</p>
									) : null}
								</div>
							)}
					</div>
				)}

				{/* Actual Slot Content */}
				<div
					className={`absolute w-full h-full overflow-scroll flex flex-col items-center justify-center text-center ${
						toolMode ? "pointer-events-none" : ""
					}`}
				>
					{slotContent}
				</div>
			</div>
		);
	};

	const getSlotSourcesList = () => {
		if (slotSourcesList?.length > 0 && renderType === "detail") {
			return (
				<div className="max-w-fit w-[80%] mt-5">
					<SlotSourcesList
						title={"Sources inside Slot:"}
						sources={slotSourcesList}
						removal={removeSource}
						staticTypesList={slotDataTypes}
						staticComponent={componentName}
						staticSources={slotSourcesList}
					/>
				</div>
			);
		}

		return null;
	};

	const getSlotComponentsList = () => {
		if (componentName && renderType === "detail") {
			return (
				<div className="max-w-fit w-[80%] mt-5">
					<SlotComponentsList
						title={"Compoment inside Slot:"}
						components={[componentName]}
						removal={removeComponent}
					/>
				</div>
			);
		}

		return null;
	};

	const getSettingsConstruct = () => {
		let settingsExist =
			slotSettings && Object.keys(slotSettings).length > 0;

		return (
			<>
				<SlotSettingsMissingPane
					modifySlotSettings={modifySlotSettings}
				/>
				{settingsExist && (
					<div className="flex flex-row gap-4 h-full">
						{componentName && (
							<>
								<SlotSettingsPaneContainer
									textareaVisible={textareaVisible}
								/>
								<ShowSlotSettingsJSONPaneButton
									textareaVisible={textareaVisible}
									setTextareaVisible={setTextareaVisible}
								/>
							</>
						)}
						{textareaVisible && (
							<SlotSettingsJSONPane
								slotSettings={slotSettings}
								modifySlotSettings={modifySlotSettings}
							/>
						)}
					</div>
				)}
			</>
		);
	};

	// region Rendering

	let slotNameElement = (
		<SlotName
			providerName={providerName}
			folderName={folderName}
			fileName={fileName}
			uuid={uuid}
			renderType={showSettings ? "settings" : renderType}
			additionalClasses={`cursor-default select-none rounded-lg p-1 text-center text-ellipsis w-[80%]`}
		/>
	);

	let missingComponentContent = (
		<>
			{slotNameElement}
			{getSlotSourcesList()}
		</>
	);

	let slotNameClasses = `select-none p-1 text-ellipsis`;

	if (showSettings) {
		slotNameClasses = `rounded-tr-lg absolute bottom-0 left-0 w-fit text-left ${slotNameClasses}`;
	} else {
		slotNameClasses = `rounded-lg absolute bottom-[0.5] w-[80%] text-center ${slotNameClasses}`;

		if (toolMode === "resize") {
			slotNameClasses = `opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${slotNameClasses}`;
		}
	}

	let presentComponentContent = (
		<>
			<ComponentLoader
				componentName={componentName}
				sourcesList={slotSourcesList}
				uuid={uuid}
				renderType={showSettings ? "settings" : renderType}
				slotSettings={slotSettings}
				modifySlotSettings={modifySlotSettings}
				sourcesRemoval={removeSource}
			/>
			{(toolMode === "resize" || showSettings) && (
				<SlotName
					providerName={providerName}
					folderName={folderName}
					fileName={fileName}
					uuid={uuid}
					renderType={showSettings ? "settings" : renderType}
					additionalClasses={slotNameClasses}
				/>
			)}
		</>
	);

	let renderContent = componentName
		? presentComponentContent
		: missingComponentContent;

	let infoModeContent = (
		<div
			className={`flex flex-col items-center justify-center w-full h-full`}
		>
			{slotNameElement}
			<div
				className={`flex flex-wrap space-x-2 items-center justify-center w-full h-full`}
			>
				{getSlotComponentsList()}
				{getSlotSourcesList()}
				{slotSettings && (
					<SlotSettingsDragElement
						settingsJSON={slotSettings}
						removal={removeSettings}
					/>
				)}
			</div>
		</div>
	);

	renderContent =
		infoMode === "slots" && renderType === "detail"
			? infoModeContent
			: renderContent;

	let finalRender = getDefaultSlot(renderContent);

	if (showSettings) {
		return (
			<SlotSettingsScreen
				topContent={finalRender}
				bottomContent={getSettingsConstruct()}
				closeSettings={handleCloseSettings}
				componentName={componentName}
				sources={slotData?.sources}
			/>
		);
	}

	return finalRender;
};

export default Slot;
