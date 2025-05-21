import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../../global/ToolTip";

const ShowSlotSettingsJSONPaneButton = ({
	textareaVisible,
	setTextareaVisible,
}) => {
	// Store Logic
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.showJSONPane
	) || ["⌘", "J"];

	let buttonOnClick = (e) => {
		setTextareaVisible(!textareaVisible);
	};

	useToggleOnKeyPress(keyboardShortcut, buttonOnClick);

	return (
		<button
			className="backdrop-blur-lg bg-blue-500 text-white rounded absolute top-4 left-4 w-10 h-10 flex items-center justify-center"
			onClick={buttonOnClick}
		>
			{"{ }"}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default ShowSlotSettingsJSONPaneButton;
