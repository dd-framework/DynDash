import React, { useState } from "react";
import useBoardStore from "../../stores/useBoardStore";
import useInterfaceStore from "../../stores/useInterfaceStore";
import GalleryElement from "./GalleryElement";
import ProviderIndicator from "../global/ProviderIndicator";
import {
	useUploadUtility,
	extractFileFromDragEvent,
} from "../../utility/FileUploaderUtility";

const GalleryFolder = ({ providerName, folderName }) => {
	const files = useBoardStore(
		(state) => state.dashboards[providerName][folderName]
	);
	const setActiveFileName = useBoardStore((state) => state.setActiveFileName);
	const setActiveFolderName = useBoardStore(
		(state) => state.setActiveFolderName
	);
	const setActiveProviderName = useBoardStore(
		(state) => state.setActiveProviderName
	);
	const setSlotSelection = useBoardStore((state) => state.setSlotSelection);

	const showDeleted = useInterfaceStore((state) => state.showDeleted);
	const revealFolders = useBoardStore((state) => state.revealFolders);

	const [isDragging, setIsDragging] = useState(false);

	let uploadUtility = useUploadUtility();

	// region File Uploading Logic

	let uploadDragHandler = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	let uploadDragLeaveHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	let uploadDropHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		let uploadedFile = extractFileFromDragEvent(e);
		uploadUtility(providerName, folderName, undefined, uploadedFile);
	};

	// region Rendering

	return (
		<div
			className="relative mb-6 p-6 select-none max-w-screen-xl mx-auto backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg shadow-lg"
			key={`${providerName}-${folderName}`}
		>
			<span className="flex">
				<ProviderIndicator
					provider={providerName}
					additionalClasses={"rounded-full"}
				/>
				<h1
					className="mb-3 text-xl font-black hover:underline hover:cursor-pointer"
					onClick={() => {
						revealFolders(providerName, folderName);
					}}
					onDragOver={uploadDragHandler}
					onDrop={uploadDropHandler}
					onDragLeave={uploadDragLeaveHandler}
				>
					{folderName}
				</h1>
			</span>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
				{files &&
					Object.entries(files).map(([fileName, fileData]) => {
						if (
							!showDeleted &&
							(fileData.status === "deleted" ||
								fileData.status === "newdeleted" ||
								fileData.status === "unsaveddeleted")
						) {
							return null;
						}

						return (
							<GalleryElement
								key={fileName}
								providerName={providerName}
								folderName={folderName}
								fileName={fileName}
								status={fileData.status}
								timestamp={fileData.timestamp}
								onClick={() => {
									setActiveFileName(fileName);
									setActiveFolderName(folderName);
									setActiveProviderName(providerName);
									setSlotSelection([]);
								}}
							/>
						);
					})}

				{/* Adding an empty GalleryElement Dummy as a Placeholder*/}
				{isDragging && (
					<div className="relative">
						<div className="absolute w-full h-full left-0 top-0 z-[1005] rounded-lg flex items-center justify-center bg-green-500 bg-opacity-50 backdrop-blur-sm text-white text-bg font-bold">
							Upload File
						</div>
						<GalleryElement
							providerName={providerName}
							folderName={folderName}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default GalleryFolder;
