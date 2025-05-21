import useBoardStore from "../../../stores/useBoardStore";
import useModalStore from "../../../stores/useModalStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const CreateButton = () => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.createFile
	) || ["⌘", "B"];

	// region File Creation Logic

	const createOrCopyFile = useBoardStore((state) => state.createOrCopyFile);
	const getBoard = useBoardStore((state) => state.getBoard);
	let providers = useBoardStore((state) => state.dashboards);

	const setShake = useModalStore((state) => state.setShake);
	const customPrompt = useModalStore((state) => state.customPrompt);
	const customOptionPicker = useModalStore(
		(state) => state.customOptionPicker
	);

	let createButtonOnClick = async () => {
		const providerName = await customOptionPicker(
			"Select a Provider:",
			`Available providers are:`,
			Object.keys(providers)
		);

		if (!providerName) return;

		const folder = await customOptionPicker(
			"Select a Folder:",
			`Available folders are:`,
			Object.keys(providers[providerName])
		);

		if (!folder) return;

		let newFileName;

		while (true) {
			try {
				newFileName = await customPrompt(
					"Enter Filename:",
					"Enter a new Filename. May not include spaces and cannot be a duplicate of an existing filename"
				);

				// Handle cancel action (customPrompt returns `null` when cancelled)
				if (newFileName === null) {
					return;
				}

				// Ensure newFileName is a string and has valid content
				if (typeof newFileName !== "string" || !newFileName.trim()) {
					setShake(true);
					continue; // Loop back to ask for the filename again
				}

				newFileName = newFileName
					.replaceAll("\\", "_")
					.replaceAll("/", "_")
					.replaceAll("|", "_")
					.replaceAll("<", "_")
					.replaceAll(">", "_")
					.replaceAll(":", "_")
					.replaceAll(`"`, "_")
					.replaceAll("?", "_")
					.replaceAll("*", "_")
					.replaceAll(".", "_")
					.replaceAll(" ", "_");

				if (getBoard(providerName, folder, newFileName)) {
					setShake(true);
					continue; // Loop back to ask for the filename again
				}

				break;
			} catch (error) {
				console.error("Error during filename prompt:", error);
				return; // Exit on unexpected error
			}
		}

		// Receives folderName, newFileName, originalFileName, customContent
		createOrCopyFile(
			providerName,
			folder,
			newFileName,
			undefined,
			undefined
		);
	};

	useToggleOnKeyPress(keyboardShortcut, createButtonOnClick);

	// region Icons

	// HEROICONS document-plus
	let createIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path
				fillRule="evenodd"
				d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875ZM12.75 12a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V18a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V12Z"
				clipRule="evenodd"
			/>
			<path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
		</svg>
	);

	// region Rendering

	return (
		<button
			className="relative bg-blue-500/70 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 shadow-md hover:shadow-blue-500/50 hover:ring-2 hover:ring-blue-300"
			onClick={createButtonOnClick}
		>
			{createIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default CreateButton;
