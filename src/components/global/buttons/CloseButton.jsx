import ToolTip from "../ToolTip";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";

const CloseButton = ({ closeFunction, classNames }) => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.globalClose
	) || ["esc"];

	// region Icons

	// HEROICONS x-mark
	let settingsIcon = (
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
				d="M6 18 18 6M6 6l12 12"
			/>
		</svg>
	);

	useToggleOnKeyPress(keyboardShortcut, closeFunction);

	// region Rendering

	return (
		<button
			className={`bg-gray-600/70 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400 ${classNames}`}
			onClick={closeFunction}
		>
			{settingsIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default CloseButton;
