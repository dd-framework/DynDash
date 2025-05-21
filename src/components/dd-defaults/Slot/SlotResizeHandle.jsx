import useBoardStore from "../../../stores/useBoardStore";

const SlotResizeHandle = ({
	providerName,
	folderName,
	fileName,
	uuid,
	mouseDownState,
}) => {
	// region Store Imports

	const setDragging = useBoardStore((state) => state.setDragging);
	const setDragOffset = useBoardStore((state) => state.setDragOffset);
	const setDragArea = useBoardStore((state) => state.setDragArea);
	const setDragSlotInfo = useBoardStore((state) => state.setDragSlotInfo);

	const slotData = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.data.slots[
				uuid
			]
	);

	let grid = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.data?.grid
	);

	// region Event Handling

	const handleDragStart = (e) => {
		e.stopPropagation();
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
		setDragging("resize-handle");
		setDragOffset(offset);
		setDragArea([...slotData.area]);
		setDragSlotInfo({ providerName, folderName, fileName, uuid });
	};

	const handleDragEnd = (e) => {
		e.stopPropagation();
		setDragging(null);
		setDragOffset(null);
		setDragArea(null);
		setDragSlotInfo(null);
		// mouseDownState(false);
	};

	// region Rendering

	return (
		<div
			className="flex items-center justify-center absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 w-10 h-10 z-[1004] shadow-md shadow-gray-900/50 text-3xl rounded-xl animate-purple-cycle"
			draggable={true}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			{"⤢"}
		</div>
	);
};

export default SlotResizeHandle;
