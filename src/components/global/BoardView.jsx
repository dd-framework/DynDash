import React, { useState } from "react";
import Slot from "../dd-defaults/Slot/Slot";
import AlertPane from "./AlertPane";
import BoardGrid from "./BoardGrid";
import useBoardStore from "../../stores/useBoardStore";
import {
	useUploadUtility,
	extractFileFromDragEvent,
} from "../../utility/FileUploaderUtility";

const BoardView = ({ providerName, folderName, fileName, renderType }) => {
	// region BoardView Logic

	const toolMode = useBoardStore((state) => state.toolMode);
	let boardData = useBoardStore(
		(state) => state.dashboards[providerName][folderName][fileName]?.data
	);
	let boardStatus = useBoardStore(
		(state) => state.dashboards[providerName][folderName][fileName]?.status
	);

	let isBoardDisabled = boardStatus?.includes("deleted");

	let cursor = `cursor-auto`;
	let cursors = {
		draw: "green-glow",
		move: "grab",
		resize: "default",
		select: "purple-blob",
	};
	cursor = toolMode ? `cursor-${cursors[toolMode]}` : cursor;

	const [isDragging, setIsDragging] = useState(false);

	let uploadUtility = useUploadUtility();

	if (!boardData) {
		return (
			<div
				className={`relative bg-gray-700/20 flex text-center items-center justify-center rounded-lg w-full p-${
					renderType === "preview"
						? "2 h-[200px] backdrop-blur-md border border-white/20"
						: "4 h-[80vh] overflow-hidden"
				}`}
			>
				{`Board data not found for "${fileName}".`}
			</div>
		);
	}

	// region File Uploads

	let uploadDragHandler = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (renderType !== "preview") return;
		setIsDragging(true);
	};

	let uploadDragLeaveHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	let uploadDropHandler = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		let uploadedFile = extractFileFromDragEvent(e);
		uploadUtility(providerName, folderName, fileName, uploadedFile);
	};

	// region Rendering

	return (
		<div
			className={`relative flex items-center justify-center rounded-lg w-full border-2 border-white/25 rounded-lg ${cursor} p-${
				renderType === "preview"
					? "2 h-[200px] backdrop-blur-md border border-white/20 bg-gray-500/5"
					: "4 h-[80vh] overflow-hidden shadow-lg"
			} ${
				isBoardDisabled
					? "opacity-20 cursor-not-allowed pointer-events-none"
					: ""
			}`}
			onDragOver={uploadDragHandler}
			onDrop={uploadDropHandler}
			onDragLeave={uploadDragLeaveHandler}
		>
			{/* Upload Overlay */}
			{isDragging && (
				<div className="absolute w-full h-full left-0 top-0 z-[1005] rounded-lg flex items-center justify-center bg-green-500 bg-opacity-50 backdrop-blur-sm text-white text-bg font-bold">
					Upload File
				</div>
			)}

			<div
				className="w-full h-full overflow-hidden"
				style={{
					display: "grid",
					gridTemplateColumns: `repeat(${boardData.grid.columns}, 1fr)`,
					gridTemplateRows: `repeat(${boardData.grid.rows}, 1fr)`,
					gridAutoRows: "1fr",
					gridAutoColumns: "1fr",
					gap: `${
						renderType === "preview" ? "5" : boardData.grid.gaps
					}px`,
				}}
			>
				{renderType === "detail" && (
					<BoardGrid
						providerName={providerName}
						folderName={folderName}
						fileName={fileName}
						renderType={renderType}
					/>
				)}

				{Object.entries(boardData.slots).map(([uuid]) => (
					<Slot
						providerName={providerName}
						folderName={folderName}
						fileName={fileName}
						uuid={uuid}
						key={uuid}
						renderType={renderType}
					/>
				))}

				{renderType === "detail" && (
					<AlertPane
						providerName={providerName}
						folderName={folderName}
						fileName={fileName}
					/>
				)}
			</div>
		</div>
	);
};

export default BoardView;
