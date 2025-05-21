import { useUploadUtility } from "../../../utility/FileUploaderUtility";
import useBoardStore from "../../../stores/useBoardStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const UploadButton = () => {
	let keyboardShortcut = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.uploadFile
	) || ["⌘", "U"];

	// region File Uploading Logic
	const activeProviderName = useBoardStore(
		(state) => state.activeProviderName
	);
	const activeFolderName = useBoardStore((state) => state.activeFolderName);
	const activeFileName = useBoardStore((state) => state.activeFileName);
	const getBoardStatus = useBoardStore((state) => state.getBoardStatus);
	let boardStatus = getBoardStatus(
		activeProviderName,
		activeFolderName,
		activeFileName
	);
	let uploadUtility = useUploadUtility();

	let isUploadDisabled = boardStatus?.includes("deleted");

	let uploadButtonClassName = isUploadDisabled
		? "relative flex h-10 bg-gray-600/70 text-white px-4 py-3 rounded-md shadow-md opacity-50 cursor-not-allowed pointer-events-none"
		: "relative flex h-10 bg-gray-600/70 text-white px-4 py-3 rounded-md hover:bg-gray-600 transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400";

	let uploadButtonOnChange = async (e) => {
		if (isUploadDisabled) return;
		let uploadedFile = e.target.files[0];
		e.target.value = null;
		uploadUtility(
			activeProviderName,
			activeFolderName,
			activeFileName,
			uploadedFile
		);
	};

	// region Icons

	// HEROICONS arrow-up-tray
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
				d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
			/>
		</svg>
	);

	const triggerFileUpload = () => {
		if (isUploadDisabled) return;
		document.getElementById("fileUpload").click();
	};

	useToggleOnKeyPress(keyboardShortcut, triggerFileUpload);

	// region Rendering

	return (
		<>
			<label htmlFor="fileUpload" className={uploadButtonClassName}>
				{settingsIcon}
				<ToolTip keys={keyboardShortcut} />
			</label>
			<input
				hidden
				type="file"
				id="fileUpload"
				name="fileUpload"
				accept="application/json"
				onChange={uploadButtonOnChange}
			/>
		</>
	);
};

export default UploadButton;
