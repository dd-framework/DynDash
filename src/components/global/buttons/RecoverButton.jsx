import useBoardStore from "../../../stores/useBoardStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const RecoverButton = ({ providerName, folderName, fileName }) => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.recoverFile
	) || ["⌘", "⌫"];

	const recoverFile = useBoardStore((state) => state.recoverFile);

	let recoverButtonOnClick = (e) => {
		recoverFile(providerName, folderName, fileName);
	};

	useToggleOnKeyPress(keyboardShortcut, recoverButtonOnClick);

	// region Icons

	// HEROICONS arrow-uturn-left
	let recoverIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path
				fillRule="evenodd"
				d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z"
				clipRule="evenodd"
			/>
		</svg>
	);

	// region Rendering

	return (
		<button
			className="relative bg-orange-500/70 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition duration-300 shadow-md hover:shadow-orange-500/50 hover:ring-2 hover:ring-orange-300"
			onClick={recoverButtonOnClick}
		>
			{recoverIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default RecoverButton;
