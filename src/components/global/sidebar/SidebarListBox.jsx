import React, { useState } from "react";
import SidebarBox from "./SidebarBox";
import SidebarListElement from "./SidebarListElement";
import useBoardStore from "../../../stores/useBoardStore";

const SidebarListBox = ({
	title,
	onClick,
	elementList,
	elementType,
	sortingEnabled,
	highlightingEnabled,
	removal,
	staticTypesList,
	staticComponent,
	staticSources,
	classesForElements,
}) => {
	let [sorting, setSorting] = useState("provider");

	let arrayOverlap = (array1, array2) => {
		const set = new Set(array1);
		return array2?.some((item) => set.has(item));
	};

	let activeSlotDataTypes = useBoardStore(
		(state) => state.activeSlotDataTypes
	);

	let usedSlotDataTypes = staticTypesList || activeSlotDataTypes;

	usedSlotDataTypes = usedSlotDataTypes?.flat(Infinity) || usedSlotDataTypes;

	for (let i = 0; i < usedSlotDataTypes?.length; i++) {
		usedSlotDataTypes[i] = usedSlotDataTypes[i].replaceAll("*", "");
	}

	const activeSlotComponent = useBoardStore(
		(state) => state.activeSlotComponent
	);

	let usedSlotComponent = staticComponent || activeSlotComponent;

	const activeSlotSources = useBoardStore((state) => state.activeSlotSources);

	let usedSlotSources = staticSources || activeSlotSources;

	// region Dragging Logic

	const setDragSidebarData = useBoardStore(
		(state) => state.setDragSidebarData
	);
	const setDragging = useBoardStore((state) => state.setDragging);
	const toolMode = useBoardStore((state) => state.toolMode);
	let disableListBox = toolMode && toolMode !== "select";

	const handleDragStart = (e, item, type, datatypes) => {
		e.stopPropagation();
		setDragging("sidebar");
		e.dataTransfer.setData("text", item);
		e.dataTransfer.setData("type", type);
		setDragSidebarData({
			name: item,
			elementType: type,
			dataTypes: datatypes,
		});
	};

	const handleDragEnd = (e) => {
		e.stopPropagation();
		setDragging(null);
		setDragSidebarData(null);
	};

	// region List Sorting

	let applySorting = (elementList) => {
		if (sorting === "provider") {
			return elementList;
		} else if (sorting === "name") {
			return elementList
				.slice()
				.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sorting === "dataType") {
			let getDataTypesKey = (item) => {
				if (Array.isArray(item.dataTypes)) {
					return item.dataTypes.slice().sort().join(",");
				}
				return "";
			};

			return elementList.slice().sort((a, b) => {
				const aKey = getDataTypesKey(a);
				const bKey = getDataTypesKey(b);
				return aKey.localeCompare(bKey);
			});
		}
	};

	elementList = applySorting(elementList);

	// region Sources Sorting Interface

	let sortingBox = sortingEnabled ? (
		<>
			<div className="flex space-x-2 !hover:no-underline">
				<button
					className={`text-sm hover:underline ${
						sorting === "provider" ? "opacity-100" : "opacity-50"
					}`}
					onClick={(e) => {
						e.stopPropagation();
						setSorting("provider");
					}}
				>
					provider
				</button>
				<button
					className={`text-sm hover:underline ${
						sorting === "name" ? "opacity-100" : "opacity-50"
					}`}
					onClick={(e) => {
						e.stopPropagation();
						setSorting("name");
					}}
				>
					name
				</button>
				<button
					className={`text-sm hover:underline ${
						sorting === "dataType" ? "opacity-100" : "opacity-50"
					}`}
					onClick={(e) => {
						e.stopPropagation();
						setSorting("dataType");
					}}
				>
					type
				</button>
			</div>
		</>
	) : null;

	// region Rendering

	let content = (
		<ul
			className={`space-y-2 ${
				disableListBox ? "opacity-50 pointer-events-none" : ""
			}`}
		>
			{elementList.length === 0 ? (
				<li className="text-gray-300">
					{`No Elements of type "${elementType}"`}
				</li>
			) : (
				elementList.map((element) => {
					let isCompatibleElement = undefined;
					let isPresentElement = undefined;
					let isLocalElement = element?.local;

					// While Highlighting is Enabled, check whether or not the Element is compatible or not and if it is currently present
					if (highlightingEnabled) {
						let isCompatibleSource =
							!usedSlotDataTypes ||
							arrayOverlap(element.dataTypes, usedSlotDataTypes);

						// Components are always Compatible with Slots
						isCompatibleElement =
							isCompatibleSource || elementType === "component";

						isPresentElement =
							elementType === "component"
								? usedSlotComponent === element.name
								: usedSlotSources?.includes(element.name);
					} else {
						isCompatibleElement = true;
						isPresentElement = false;
					}

					// Visibility represents the compatibility of Data Types
					// Elements with compatible Data Types are opaque
					// Elements with incomptaible Data Types are translucent (unless they are currently inside the Slot)
					let visibility = isCompatibleElement
						? "opactiy-100"
						: isPresentElement
						? "opacity-100"
						: "opacity-30";

					// Border-Styling is used to show which Elements are currently inside the Slot
					// Regular Elements are styled with a white border
					// Elements with compatible Data Types recieve a green Border
					// Elements with incomptaible Data Types recieve a red Border
					let defaultBorderColor = isLocalElement
						? "border-white/60"
						: "border-white/20";

					let borderStyle = isLocalElement
						? "border-dashed"
						: "border-solid";

					let border = isPresentElement
						? isCompatibleElement
							? elementType === "component"
								? "border-purple-400/80 text-purple-400"
								: "border-green-400/80 text-green-400"
							: "border-red-400/80 text-red-400"
						: defaultBorderColor;

					border = `${border} ${borderStyle}`;

					return (
						<li
							key={`sidebar-${element.name}`}
							draggable
							onDragStart={(e) =>
								handleDragStart(
									e,
									element.name,
									elementType,
									element.dataTypes
								)
							}
							onDragEnd={handleDragEnd}
							className={`relative ${visibility} cursor-grab bg-gray-800/70 backdrop-blur-md border ${border} p-2 rounded-lg shadow-md group/li hover:shadow-[0_10px_30px_5px_rgba(38,38,38,0.8)] hover:shadow-blue-500/50 hover:ring-4 hover:ring-blue-500 hover:ring-purple-500 hover:ring-opacity-40 transition-all ease-in-out duration-300 ${classesForElements}`}
						>
							<SidebarListElement
								name={element.name}
								displayName={element.displayName}
								information={element.information}
								explanation={element.explanation}
								dataTypes={element.dataTypes}
								icon={element.icon}
								sidebarElementType={elementType}
							/>
							{removal ? (
								<button
									className="absolute top-0.5 left-1 opacity-0 select-none group-hover/li:opacity-100 hover:text-red-500 text-3xl text-white/50 font-black"
									onClick={(e) => {
										e.stopPropagation();
										removal(element.name);
									}}
								>
									&times;
								</button>
							) : null}
						</li>
					);
				})
			)}
		</ul>
	);

	return (
		<SidebarBox
			title={title}
			onClick={onClick}
			content={content}
			sorting={sortingBox}
		/>
	);
};

export default SidebarListBox;
