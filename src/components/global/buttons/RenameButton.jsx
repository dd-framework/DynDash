import useBoardStore from "../../../stores/useBoardStore";
import useModalStore from "../../../stores/useModalStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const RenameButton = ({ providerName, folderName, fileName }) => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.renameFile
	) || ["⌘", "E"];

	// region File Renaming Logic

	const renameFile = useBoardStore((state) => state.renameFile);

	const getBoard = useBoardStore((state) => state.getBoard);
	const getBoardStatus = useBoardStore((state) => state.getBoardStatus);
	let boardStatus = getBoardStatus(providerName, folderName, fileName);

	const customPrompt = useModalStore((state) => state.customPrompt);
	const setShake = useModalStore((state) => state.setShake);

	let isRenameDisabled =
		!fileName ||
		!boardStatus ||
		boardStatus.includes("unsaved") ||
		boardStatus.includes("deleted");

	let renameButtonClassName = isRenameDisabled
		? "relative bg-gray-600/70 text-white px-4 py-2 rounded-md shadow-md opacity-50 cursor-not-allowed"
		: "relative bg-gray-600/70 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400";

	let renameButtonOnClick = async () => {
		if (isRenameDisabled) {
			console.log("File was not eligible to be renamed");
			return;
		}

		let newFileName;

		while (true) {
			try {
				newFileName = await customPrompt(
					`Rename "${fileName}":`,
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

				if (getBoard(providerName, folderName, newFileName)) {
					setShake(true);
					continue; // Loop back to ask for the filename again
				}

				break;
			} catch (error) {
				console.error("Error during filename prompt:", error);
				return; // Exit on unexpected error
			}
		}

		if (newFileName) {
			renameFile(providerName, folderName, fileName, newFileName);
		}
	};

	useToggleOnKeyPress(
		keyboardShortcut,
		renameButtonOnClick,
		isRenameDisabled
	);

	// region Icons

	// HEROICONS pencil-square
	let renameIcon = (
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
				d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
			/>
		</svg>
	);

	// region Rendering

	return (
		<button className={renameButtonClassName} onClick={renameButtonOnClick}>
			{renameIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default RenameButton;
