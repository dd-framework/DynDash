import useBoardStore from "../../../stores/useBoardStore";

const SlotResizeButtons = ({
	providerName,
	folderName,
	fileName,
	uuid,
	orientation,
}) => {
	// region Click Handling

	const slotData = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.data.slots[
				uuid
			]
	);

	const updateSlotData = useBoardStore((state) => state.updateSlotData);

	const handleAdjustArea = (delta) => {
		if (!slotData || !slotData.area) return;

		const updatedArea = [...slotData.area];
		if (orientation === "vertical") {
			updatedArea[2] = Math.max(
				parseInt(updatedArea[0], 10),
				parseInt(updatedArea[2], 10) + delta
			); // Adjust row-end, cannot go lower than row-start
		} else {
			updatedArea[3] = Math.max(
				parseInt(updatedArea[1], 10),
				parseInt(updatedArea[3], 10) + delta
			); // Adjust col-end, cannot go lower than col-start
		}

		updateSlotData(providerName, folderName, fileName, uuid, {
			area: updatedArea,
		});
	};

	// region Rendering

	return (
		<div
			className={`absolute select-none transition-opacity duration-300 z-[1004] flex items-center justify-center ${
				orientation === "vertical" ? "flex-col h-14" : "flex-row w-14"
			}`}
			style={{
				bottom: orientation === "vertical" ? "0" : "50%",
				right: orientation === "vertical" ? "50%" : "0",
				transform: "translateX(50%) translateY(50%)",
			}}
		>
			<button
				className="w-7 h-7 text-xs select-none bg-[#941ef8] transition-colors text-white border border-gray-500 rounded-full flex items-center justify-center p-[0.25rem] hover:bg-red-600 active:bg-red-700"
				onClick={(e) => {
					e.stopPropagation();
					handleAdjustArea(-1);
				}}
			>
				-
			</button>
			<button
				className="w-7 h-7 text-xs select-none bg-[#941ef8] transition-colors text-white border border-gray-500 rounded-full flex items-center justify-center p-[0.25rem] hover:bg-green-600 active:bg-green-700"
				onClick={(e) => {
					e.stopPropagation();
					handleAdjustArea(1);
				}}
			>
				+
			</button>
		</div>
	);
};

export default SlotResizeButtons;
