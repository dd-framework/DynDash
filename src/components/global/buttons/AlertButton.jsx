import ToolTip from "../ToolTip";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import useInterfaceStore from "../../../stores/useInterfaceStore";

const AlertButton = ({ additionalClasses }) => {
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.toggleAlerts
	) || ["⌘", "A"];

	// region Store Logic

	const alertMode = useInterfaceStore((state) => state.alertMode);
	const setAlertMode = useInterfaceStore((state) => state.setAlertMode);

	// region Visuals

	// HEROICONS eye-slash
	let hideIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-6"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
			/>
		</svg>
	);

	// region Keyboard Shortcuts
	let buttonOnClick = (e) => {
		setAlertMode(!alertMode);
	};

	useToggleOnKeyPress(keyboardShortcut, buttonOnClick);

	return (
		<button
			className={`${additionalClasses} absolute top-0 left-0 flex items-center justify-center w-8 h-8 p-2 bg-red-500 z-[1003] text-white rounded-full hover:bg-red-500 transition duration-300 shadow-md hover:shadow-red-500/50 hover:ring-2 hover:ring-red-300`}
			onClick={buttonOnClick}
		>
			{alertMode ? hideIcon : "!"}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default AlertButton;
