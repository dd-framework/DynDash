import useBoardStore from "../../stores/useBoardStore";
import ProviderIndicator from "./ProviderIndicator";

const FileName = ({ providerName, folderName, fileName, renderType }) => {
	// region Coloring and Marking Logic

	let timestamp = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.timestamp ||
			Date.now() / 1000
	);

	const getBoardStatus = useBoardStore((state) => state.getBoardStatus);
	let boardStatus =
		folderName && fileName
			? getBoardStatus(providerName, folderName, fileName)
			: "new";

	const revealFolders = useBoardStore((state) => state.revealFolders);

	let nameClass = "text-xl font-bold ";
	let displayName = fileName || "Unknown File";

	let timestampDate = new Date(timestamp * 1000);

	let timestampDisplay = timestampDate
		.toISOString()
		.replace(/-/g, ".")
		.replace("T", " (")
		.slice(0, 17);

	timestampDisplay = `${timestampDisplay})`;

	let recoverable = boardStatus.includes("deleted");
	let ephemeral =
		boardStatus.includes("new") || boardStatus.includes("unsaved");

	// Apply different styles and transformations based on the file status
	let colorTable = { unsaved: "yellow", new: "green", disk: "white" };
	let color = recoverable ? "red" : colorTable[boardStatus];
	nameClass = `${
		renderType === "detail" ? "pl-2" : ""
	} ${nameClass} text-${color}-500`;

	if (ephemeral) {
		displayName = `${fileName}*`;
		nameClass = `${nameClass} italic`;
	}

	// region Rendering

	return (
		<span
			className={`flex overflow-scroll ${
				renderType === "detail"
					? "flex-row items-center pl-3"
					: "flex-col mb-1"
			}`}
		>
			{/* Include FolderName */}
			{folderName && renderType === "detail" && (
				<>
					<ProviderIndicator
						provider={providerName}
						additionalClasses={"rounded-full min-w-7 min-h-7"}
					/>
					<span
						className="text-xl font-bold hover:underline"
						onClick={() => {
							revealFolders(providerName, folderName);
						}}
					>
						{folderName}
					</span>
					<span className={`text-xl font-bold pl-2 text-white`}>
						/
					</span>
				</>
			)}

			<span className={nameClass}>{displayName}</span>
			<span
				className={`${
					renderType === "detail" ? "pl-2" : ""
				} text-sm text-gray-200 opacity-25 text-nowrap`}
			>
				{timestampDisplay}
			</span>
		</span>
	);
};

export default FileName;
