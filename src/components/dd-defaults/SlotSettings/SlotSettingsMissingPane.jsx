const SlotSettingsMissingPane = ({ modifySlotSettings }) => {
	return (
		<div className="backdrop-blur-lg bg-gray-500/40 border border-white/20 rounded-lg shadow-lg text-white flex items-center justify-center h-full child only:flex hidden">
			<p className="text-white p-2">This Slot has no Settings</p>
			<button
				className="bg-green-500 text-white p-2 rounded"
				onClick={() => {
					modifySlotSettings({
						_comment: "use the interface or this textbox",
					});
				}}
			>
				Add Settings
			</button>
		</div>
	);
};

export default SlotSettingsMissingPane;
