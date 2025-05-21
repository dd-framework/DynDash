import useModalStore from "../stores/useModalStore";
import useBoardStore from "../stores/useBoardStore";

// region DragEvent File Extraction

export const extractFileFromDragEvent = (e) => {
	try {
		let firstElement = e?.dataTransfer?.items[0];
		if (
			!firstElement ||
			firstElement?.kind !== "file" ||
			firstElement?.type !== "application/json"
		) {
			return null;
		}

		let uploadedFile = firstElement.getAsFile();
		return uploadedFile;
	} catch {
		return null;
	}
};

// region uploadUtility

export const useUploadUtility = () => {
	// region Store Functions

	// Existence Checking
	const getBoard = useBoardStore((state) => state.getBoard);
	const providers = useBoardStore((state) => state.dashboards);

	// State Modifications
	const createOrCopyFile = useBoardStore((state) => state.createOrCopyFile);
	const replaceFile = useBoardStore((state) => state.replaceFile);
	const setGridInfo = useBoardStore((state) => state.setGridInfo);

	// Modal Functions
	const setShake = useModalStore((state) => state.setShake);
	const customPrompt = useModalStore((state) => state.customPrompt);
	const customOptionPicker = useModalStore(
		(state) => state.customOptionPicker
	);

	// Actual Reading and Executing
	return async (providerName, folderName, fileName, uploadedFile) => {
		if (!uploadedFile || uploadedFile.type !== "application/json") return;
		const reader = new FileReader();

		// File Reading Logic
		reader.onload = async (e) => {
			try {
				let parsedJSON = JSON.parse(e.target.result);
				if (!parsedJSON) return;

				// region folderName && fileName

				// If both are given, such as when
				// - dragging onto BoardView in renderType detail or preview
				// - clicking on UploadButton in when BoardView is large in renderType detail
				if (folderName && fileName) {
					const choice = await customOptionPicker(
						`Overwrite "${fileName}"'s Content"?`,
						`Are you sure you want to overwrite the file content of "${fileName}" from the folder "${folderName}" with the content from the uploaded File?`,
						[
							"Yes, replace entire File Content",
							"Replace only the Grid Structure",
						]
					);

					if (choice === "Yes, replace entire File Content") {
						replaceFile(
							providerName,
							folderName,
							fileName,
							parsedJSON
						);
						return;
					} else if (
						choice === "Replace only the Grid Structure" &&
						parsedJSON["grid"]
					) {
						setGridInfo(
							providerName,
							folderName,
							fileName,
							parsedJSON["grid"]
						);
						return;
					} else {
						return;
					}
				}

				// region getting fileName

				let getFileName = async (providerName, folderName) => {
					let newFileName = uploadedFile.name.replace(".json", "");

					if (!fileName) {
						while (
							typeof newFileName !== "string" ||
							!newFileName.trim() ||
							newFileName.includes(" ") ||
							getBoard(providerName, folderName, newFileName)
						) {
							try {
								newFileName = await customPrompt(
									"Filename Unavailable. Choose New Filename:",
									"Enter a new Filename. May not include spaces and cannot be a duplicate of an existing filename"
								);

								// Handle cancel action (customPrompt returns `null` when cancelled)
								if (newFileName === null) {
									return;
								}

								// Ensure newFileName is a string and has valid content
								if (
									typeof newFileName !== "string" ||
									!newFileName.trim()
								) {
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

								if (
									getBoard(
										providerName,
										folderName,
										newFileName
									)
								) {
									setShake(true);
									continue; // Loop back to ask for the filename again
								}

								break;
							} catch (error) {
								console.error(
									"Error during filename prompt:",
									error
								);
								return; // Exit on unexpected error
							}
						}

						fileName = newFileName;
					}

					return fileName;
				};

				// region getting providerName

				// If the providerName is missing, such as when
				// - clicking on UploadButton in Gallery View
				if (!providerName) {
					const providerName = await customOptionPicker(
						"Select a Provider:",
						`Available providers are:`,
						Object.keys(providers)
					);

					if (!providerName) return;

					// region getting folderName

					// If the folderName is missing, such as when
					// - clicking on UploadButton in Gallery View
					if (!folderName) {
						folderName = await customOptionPicker(
							"Select Target Folder:",
							`Available folders are:`,
							Object.keys(providers[providerName])
						);

						if (!folderName) return;

						// If the fileName is missing, such as when
						// - clicking on UploadButton in Gallery View
						fileName = await getFileName(providerName, folderName);
						createOrCopyFile(
							providerName,
							folderName,
							fileName,
							undefined,
							parsedJSON
						);

						return;
					}
				}

				// If the fileName is missing, such as when
				// - dragging onto FolderName in Gallery View
				fileName = await getFileName(providerName, folderName);
				createOrCopyFile(
					providerName,
					folderName,
					fileName,
					undefined,
					parsedJSON
				);
			} catch (error) {
				console.error("Error parsing JSON file:", error);
			}
		};

		reader.readAsText(uploadedFile);
	};
};
