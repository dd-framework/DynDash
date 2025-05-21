import useBoardStore from "../../../stores/useBoardStore";
import useAlertStore from "../../../stores/useAlertStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const NavigationButton = ({ direction }) => {
	let navigationKey = `${direction}File`;
	let navigationArrow = direction === "right" ? "→" : "←";

	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts[navigationKey]
	) || ["⌘", "⇧", navigationArrow];

	const navigateFile = useBoardStore((state) => state.navigateFile);
	const setAlertHover = useAlertStore((state) => state.setAlertHover);

	let navigationButtonOnClick = (e) => {
		navigateFile(direction);
		setAlertHover(null);
	};

	useToggleOnKeyPress(keyboardShortcut, navigationButtonOnClick);

	// region Icons

	let getArrow = (direction) => {
		let arrows = {
			left: "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18", // HEROICONS arrow-left
			right: "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3", // HEROICONS arrow-right
		};

		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-5 h-5 mr-0 inline align-middle"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d={arrows[direction]}
				/>
			</svg>
		);
	};

	// region Rendering

	return (
		<button
			className={`absolute bg-gray-600/30 text-white rounded-full px-6 py-3 ${
				direction === "right"
					? "left-[100%] !ml-5 !mr-0"
					: "right-[100%] !mr-5 !ml-0"
			} opacity-0 group-hover:opacity-80 transition duration-300 shadow-md hover:bg-gray-600/60 hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400/30`}
			onClick={navigationButtonOnClick}
		>
			{getArrow(direction)}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default NavigationButton;
