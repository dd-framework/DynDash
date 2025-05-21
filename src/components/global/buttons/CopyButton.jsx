import useBoardStore from "../../../stores/useBoardStore";
import useModalStore from "../../../stores/useModalStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const CopyButton = ({ providerName, folderName, fileName }) => {
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.duplicateFile
	) || ["⌘", "B"];

	// region File Copying Logic

	const createOrCopyFile = useBoardStore((state) => state.createOrCopyFile);
	const getBoard = useBoardStore((state) => state.getBoard);
	const customConfirm = useModalStore((state) => state.customConfirm);

	let copyButtonOnClick = async () => {
		// Evil fileName magic
		let newFileName = `${fileName}_COPY_1`;
		const match = fileName.match(/_COPY_(\d+)$/);

		if (match) {
			const currentNumber = parseInt(match[1], 10);
			const newNumber = currentNumber + 1;
			newFileName = `${fileName.replace(
				/_COPY_\d+$/,
				""
			)}_COPY_${newNumber}`;
		}

		if (
			!newFileName ||
			getBoard(providerName, folderName, newFileName) ||
			newFileName?.includes(" ")
		) {
			await customConfirm(
				"Generating New Name",
				"Automatic naming failed, generating unique name."
			);
			newFileName = `${newFileName}_${crypto.randomUUID()}`;
		}

		// Receives providerName, folderName, newFileName, originalFileName, customContent

		createOrCopyFile(
			providerName,
			folderName,
			newFileName,
			fileName,
			undefined
		);
	};

	useToggleOnKeyPress(keyboardShortcut, copyButtonOnClick);

	// region Icons

	// HEROICONS document-duplicate
	let copyIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875C13.5 8.161 14.34 9 15.375 9h1.875A3.75 3.75 0 0 1 21 12.75v3.375C21 17.16 20.16 18 19.125 18h-9.75A1.875 1.875 0 0 1 7.5 16.125V3.375Z" />
			<path d="M15 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 17.25 7.5h-1.875A.375.375 0 0 1 15 7.125V5.25ZM4.875 6H6v10.125A3.375 3.375 0 0 0 9.375 19.5H16.5v1.125c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V7.875C3 6.839 3.84 6 4.875 6Z" />
		</svg>
	);

	// region Rendering

	return (
		<button
			className="relative bg-blue-500/70 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition duration-300 shadow-md hover:shadow-blue-500/50 hover:ring-2 hover:ring-blue-300"
			onClick={copyButtonOnClick}
		>
			{copyIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default CopyButton;
