import useBoardStore from "../../../stores/useBoardStore";
import useModalStore from "../../../stores/useModalStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const DeleteButton = ({ providerName, folderName, fileName }) => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.deleteFile
	) || ["⌘", "⌫"];

	// region File Deletion Logic

	const deleteFile = useBoardStore((state) => state.deleteFile);
	const customConfirm = useModalStore((state) => state.customConfirm);

	const getBoardStatus = useBoardStore((state) => state.getBoardStatus);
	let boardStatus = getBoardStatus(providerName, folderName, fileName);

	let deleteButtonOnClick = async () => {
		let extraWarning = "It can likely be recovered from the .trash folder";
		if (boardStatus === "new") {
			extraWarning =
				"Since this is a new file, it will be lost forever, if not recovered before refreshing the browser's session.";
		} else if (boardStatus === "unsaved") {
			extraWarning =
				"The unsaved changes in this file will be lost forever, if not recovered before refreshing the browser's session.";
		}
		const confirmation = await customConfirm(
			`Delete "${fileName}"?`,
			`Are you sure you want to delete the file "${fileName}" from the folder "${folderName}"?\n\n${extraWarning}`
		);
		if (confirmation) {
			deleteFile(providerName, folderName, fileName);
		}
	};

	useToggleOnKeyPress(keyboardShortcut, deleteButtonOnClick);

	// region Icons

	// HEROICONS trash
	let deleteIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path
				fillRule="evenodd"
				d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
				clipRule="evenodd"
			/>
		</svg>
	);

	// region Rendering

	return (
		<button
			className="relative bg-red-500/70 text-white px-4 py-2 rounded-md hover:bg-red-500 transition duration-300 shadow-md hover:shadow-red-500/50 hover:ring-2 hover:ring-red-300"
			onClick={deleteButtonOnClick}
		>
			{deleteIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default DeleteButton;
