import useInterfaceStore from "../../../stores/useInterfaceStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const ToolTipButton = () => {
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.toggleToolTips
	) || ["⌘", "J"];

	const toolTipMode = useInterfaceStore((state) => state.toolTipMode);
	const setToolTipMode = useInterfaceStore((state) => state.setToolTipMode);

	let toolTipButtonOnClick = (e) => {
		if (toolTipMode === null) setToolTipMode("keys");
		if (toolTipMode === "keys") setToolTipMode(null);
	};

	useToggleOnKeyPress(keyboardShortcut, toolTipButtonOnClick);

	let toolTipModeBasedValue = (valueFalse, valueKeys) => {
		return toolTipMode === "keys" ? valueKeys : valueFalse;
	};

	// region Rendering

	return (
		<>
			<button
				className={`relative min-w-[52px] h-10 rounded-md bg-gray-800/70 
						transition duration-200 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400
						${toolTipModeBasedValue("bg-gray-800/70", "bg-purple-500")}`}
				onClick={toolTipButtonOnClick}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-6 h-9 rounded-md
						  transform transition-transform duration-200 
						  ${toolTipModeBasedValue(
								"translate-x-0 bg-white/20",
								"translate-x-6 bg-white/100 shadow-sm shadow-black/60"
							)}`}
				>
					<span
						className={`flex text-center items-center justify-center h-full ${toolTipModeBasedValue(
							"text-white/20",
							"text-black/50"
						)}`}
					>
						{"⌘"}
					</span>
				</span>
				<ToolTip keys={keyboardShortcut} />
			</button>
		</>
	);
};

export default ToolTipButton;
