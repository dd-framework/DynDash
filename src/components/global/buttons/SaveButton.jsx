import useBoardStore from "../../../stores/useBoardStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const SaveButton = ({ providerName, folderName, fileName }) => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.saveFile
	) || ["⌘", "S"];

	// region File Saving Logic

	const saveFile = useBoardStore((state) => state.saveFile);

	const getUnsavedFiles = useBoardStore((state) => state.getUnsavedFiles);
	const unsavedFiles = getUnsavedFiles();

	const getBoardStatus = useBoardStore((state) => state.getBoardStatus);
	let boardStatus = fileName
		? getBoardStatus(providerName, folderName, fileName)
		: "";

	let isSaveEnabled = fileName
		? boardStatus === "unsaved" || boardStatus === "new"
		: unsavedFiles.length;

	let saveButtonClassName = !isSaveEnabled
		? "relative bg-green-500/70 text-white px-4 py-2 rounded-md shadow-md opacity-50 cursor-not-allowed"
		: "relative bg-green-500/70 text-white px-4 py-2 rounded-md hover:bg-green-500 transition duration-300 shadow-md hover:shadow-blue-500/50 hover:ring-2 hover:ring-blue-300";

	let saveButtonOnClick = async () => {
		if (fileName) {
			if (boardStatus === "new" || boardStatus === "unsaved") {
				await saveFile(providerName, folderName, fileName);
			} else {
				console.log("Nothing to save here.");
			}
		} else if (unsavedFiles.length > 0) {
			await Promise.all(
				unsavedFiles.map(([providerName, folderName, fileName]) =>
					saveFile(providerName, folderName, fileName)
				)
			);
		} else {
			console.log("No files to save.");
		}
	};

	useToggleOnKeyPress(keyboardShortcut, saveButtonOnClick);

	// region Icons

	// HEROICONS arrow-down-on-square
	let saveIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5ZM11.25 7.5v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.75Z" />
		</svg>
	);

	// HEROICONS arrow-down-on-square-stack
	let saveAllIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path
				fillRule="evenodd"
				d="M9.75 6.75h-3a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3h7.5a3 3 0 0 0 3-3v-7.5a3 3 0 0 0-3-3h-3V1.5a.75.75 0 0 0-1.5 0v5.25Zm0 0h1.5v5.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V6.75Z"
				clipRule="evenodd"
			/>
			<path d="M7.151 21.75a2.999 2.999 0 0 0 2.599 1.5h7.5a3 3 0 0 0 3-3v-7.5c0-1.11-.603-2.08-1.5-2.599v7.099a4.5 4.5 0 0 1-4.5 4.5H7.151Z" />
		</svg>
	);

	// region Rendering

	return (
		<button className={saveButtonClassName} onClick={saveButtonOnClick}>
			{fileName ? saveIcon : saveAllIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default SaveButton;
