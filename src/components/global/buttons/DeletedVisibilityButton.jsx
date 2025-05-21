import useInterfaceStore from "../../../stores/useInterfaceStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const DeletedVisibilityButton = () => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.showDeleted
	) || ["⌘", "⌫"];

	const showDeleted = useInterfaceStore((state) => state.showDeleted);
	const setShowDeleted = useInterfaceStore((state) => state.setShowDeleted);

	let buttonOnClick = (e) => {
		setShowDeleted(!showDeleted);
	};

	useToggleOnKeyPress(keyboardShortcut, buttonOnClick);

	let deletedModeBasedValue = (valueFalse, valueTrue) => {
		return showDeleted ? valueTrue : valueFalse;
	};

	// region Icons

	// HEROICONS eye
	let showIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
			<path
				fillRule="evenodd"
				d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z"
				clipRule="evenodd"
			/>
		</svg>
	);

	// HEROICONS eye-slash
	let hideIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
			<path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
			<path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
		</svg>
	);

	// region Rendering

	return (
		<>
			<button
				className={`relative min-w-[52px] h-10 rounded-md bg-gray-800/70 
						transition duration-200 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400
						${deletedModeBasedValue("bg-gray-800/70", "bg-red-500/70")}`}
				onClick={buttonOnClick}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-6 h-9 rounded-md
						  transform transition-transform duration-200 
						  ${deletedModeBasedValue(
								"translate-x-0 bg-white/20",
								"translate-x-6 bg-white/100 shadow-sm shadow-black/60"
							)}`}
				>
					<span
						className={`flex text-center items-center justify-center h-full ${deletedModeBasedValue(
							"text-white/20",
							"text-black/50"
						)}`}
					>
						{deletedModeBasedValue(hideIcon, showIcon)}
					</span>
				</span>
				<ToolTip keys={keyboardShortcut} />
			</button>
		</>
	);
};

export default DeletedVisibilityButton;
