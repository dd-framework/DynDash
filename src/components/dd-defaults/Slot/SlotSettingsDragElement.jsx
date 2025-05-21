import useBoardStore from "../../../stores/useBoardStore";

const SlotSettingsDragElement = ({ settingsJSON, removal }) => {
	// region Dragging Behaviour

	const setDragging = useBoardStore((state) => state.setDragging);
	const setDragSettingsData = useBoardStore(
		(state) => state.setDragSettingsData
	);

	const handleDragStart = (e) => {
		e.stopPropagation();
		setDragging("settings");
		e.dataTransfer.setData("type", "settings");
		setDragSettingsData(settingsJSON);
	};

	const handleDragEnd = (e) => {
		e.stopPropagation();
		setDragging(null);
		setDragSettingsData(null);
	};

	let keyCount = Object.keys(settingsJSON)?.length;
	let keyCountLabel = `${keyCount} key${keyCount === 1 ? "" : "s"}`;

	if (!settingsJSON || keyCount === 0) return;

	// region Rendering

	return (
		<div
			draggable
			onDragStart={(e) => handleDragStart(e)}
			onDragEnd={handleDragEnd}
			className={`absolute top-3 right-3 cursor-grab bg-gray-800/70 backdrop-blur-md border p-2 rounded-lg shadow-md group/li hover:shadow-[0_10px_30px_5px_rgba(38,38,38,0.8)] hover:shadow-blue-500/50 hover:ring-4 hover:ring-blue-500 hover:ring-purple-500 hover:ring-opacity-40 transition-all ease-in-out duration-300 animate-wigglesmall`}
		>
			<div className="relative">
				<p>{"Settings"}</p>
				<p className="text-xs text-white/50">{keyCountLabel}</p>
			</div>
			{removal ? (
				<button
					className="absolute top-0.5 left-1 opacity-0 select-none group-hover/li:opacity-100 hover:text-red-500 text-3xl text-white/50 font-black"
					onClick={(e) => {
						e.stopPropagation();
						removal();
					}}
				>
					&times;
				</button>
			) : null}
		</div>
	);
};

export default SlotSettingsDragElement;
