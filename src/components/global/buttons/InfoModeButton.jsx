import useInterfaceStore from "../../../stores/useInterfaceStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const InfoModeButton = () => {
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.toggleInfoMode
	) || ["⌘", "I"];

	const infoMode = useInterfaceStore((state) => state.infoMode);
	const setInfoMode = useInterfaceStore((state) => state.setInfoMode);

	let infoButtonOnClick = (e) => {
		if (infoMode === null) setInfoMode("info");
		if (infoMode === "info") setInfoMode("slots");
		if (infoMode === "slots") setInfoMode(null);
	};

	useToggleOnKeyPress(keyboardShortcut, infoButtonOnClick);

	let modeBasedValue = (valueFalse, valueTrue, valueTruePlus) => {
		return infoMode
			? infoMode === "slots"
				? valueTruePlus
				: valueTrue
			: valueFalse;
	};

	// region Rendering

	return (
		<>
			<button
				className={`relative min-w-[52px] h-10 rounded-md bg-gray-800/70 
						transition duration-200 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400
						${modeBasedValue(
							"bg-gray-800/70",
							"bg-gradient-to-r from-purple-500 via-purple-500 via-purple-500 via-purple-500/40 to-gray-800/70",
							"bg-gradient-to-r from-purple-500 via-purple-500 to from-purple-500"
						)}`}
				onClick={infoButtonOnClick}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-6 h-9 rounded-md
						  transform transition-transform duration-200 
						  ${modeBasedValue(
								"translate-x-0 bg-white/20",
								"translate-x-3 bg-white/100 shadow-sm shadow-black/60",
								"translate-x-6 bg-white/100 shadow-sm shadow-black/60"
							)}`}
				>
					<span
						className={`flex text-center items-center justify-center h-full
							${modeBasedValue(
								"text-white/20 font-sans",
								"text-black/50 font-mono",
								"text-black/50 font-sans"
							)}
						`}
					>
						{modeBasedValue("?", "i", "□")}
					</span>
				</span>
				<ToolTip keys={keyboardShortcut} />
			</button>
		</>
	);
};

export default InfoModeButton;
