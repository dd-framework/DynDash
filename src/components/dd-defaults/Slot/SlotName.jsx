import useBoardStore from "../../../stores/useBoardStore";

const SlotName = ({
	providerName,
	folderName,
	fileName,
	uuid,
	renderType,
	additionalClasses,
}) => {
	// region Input Handling

	const toolMode = useBoardStore((state) => state.toolMode);

	let bgColor =
		toolMode === "resize"
			? "animate-purple-cycle pointer-events-auto"
			: "bg-gray-500/0";
	let stylingClasses = `${bgColor} ${additionalClasses} z-[1004]`;

	const slotData = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.data.slots[
				uuid
			]
	);

	const updateSlotData = useBoardStore((state) => state.updateSlotData);

	const handleChange = (e) => {
		const newValue = e.target.value;
		updateSlotData(providerName, folderName, fileName, uuid, {
			name: newValue,
		});
	};

	// region Rendering

	if (!["detail", "settings"].includes(renderType)) return slotData.name;

	let input = (
		<input
			className={stylingClasses}
			value={slotData.name}
			onClick={(e) => {
				e.stopPropagation();
			}}
			onChange={handleChange}
		/>
	);

	let p = <p className={stylingClasses}>{slotData.name}</p>;

	return toolMode === "resize" ? input : p;
};

export default SlotName;
