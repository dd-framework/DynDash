import { create } from "zustand";
import useProviderStore from "./useProviderStore";

const useBoardStore = create((set, get) => ({
	dashboards: {},
	activeFileName: null,
	activeFolderName: null,
	activeProviderName: null,
	gridMode: "grid",
	toolMode: null,
	activeSlotComponent: null,
	activeSlotSources: null,
	activeSlotDataTypes: null,
	settingsViewActive: false,
	dragging: null,
	dragOffset: null,
	dragArea: null,
	dragSlotInfo: null,
	dragSidebarData: null,
	dragSettingsData: null,
	slotSelection: [],
	slotSelectionDragOver: false,

	setActiveFileName: (fileName) => set({ activeFileName: fileName }),
	setActiveFolderName: (folderName) => set({ activeFolderName: folderName }),
	setActiveProviderName: (providerName) =>
		set({ activeProviderName: providerName }),

	setGridMode: (value) => set({ gridMode: value }),
	setActiveSlotComponent: (value) => set({ activeSlotComponent: value }),
	setActiveSlotSources: (value) => set({ activeSlotSources: value }),
	setActiveSlotDataTypes: (value) => set({ activeSlotDataTypes: value }),
	setSettingsViewActive: (value) => set({ settingsViewActive: value }),
	setDragging: (value) => set({ dragging: value }),
	setDragOffset: (value) => set({ dragOffset: value }),
	setDragArea: (value) => set({ dragArea: value }),
	setDragSlotInfo: (value) => set({ dragSlotInfo: value }),
	setDragSidebarData: (value) => set({ dragSidebarData: value }),
	setDragSettingsData: (value) => set({ dragSettingsData: value }),
	setSlotSelectionDragOver: (value) => set({ slotSelectionDragOver: value }),
	setSlotSelection: (value) => set({ slotSelection: value }),
	appendSlotSelection: (value) =>
		set((state) => ({ slotSelection: state.slotSelection.concat(value) })),
	setToolMode: (value) =>
		set((state) => ({
			toolMode: value,
			slotSelection: value === "select" ? state.slotSelection : [],
		})),

	dashboardProviders: useProviderStore.getState()?.dashboardProviders || [],
	generalProviders: useProviderStore.getState()?.generalProviders || [],
	doesProviderServe: useProviderStore.getState()?.doesProviderServe,
	getProviderElementList: useProviderStore.getState()?.getProviderElementList,

	// region NavigateFile
	navigateFile: (direction) => {
		let state = get();
		if (
			!state ||
			!state.activeProviderName ||
			!state.activeFolderName ||
			!state.activeFileName
		)
			return;

		let files = Object.keys(
			state.dashboards[state.activeProviderName][state.activeFolderName]
		);
		let currentIndex = files.indexOf(state.activeFileName);

		let nextIndex = currentIndex + (direction === "right" ? 1 : -1);
		if (nextIndex >= files?.length) nextIndex = 0;
		if (nextIndex < 0) nextIndex = files?.length - 1;

		let newActiveFileName = files[nextIndex];
		if (!newActiveFileName) return;

		set((state) => ({
			...state,
			activeFileName: newActiveFileName,
			activeSlotComponent: null,
			activeSlotSources: null,
			activeSlotDataTypes: null,
		}));
	},

	// region MutateFile

	mutateFile: (providerName, folderName, fileName, updatedFile) => {
		set((state) => ({
			dashboards: {
				...state.dashboards,
				[providerName]: {
					...state.dashboards[providerName],
					[folderName]: {
						...state.dashboards[providerName][folderName],
						[fileName]: updatedFile,
					},
				},
			},
		}));
	},

	// region MutateFileData

	mutateFileData: (providerName, folderName, fileName, updatedData) => {
		let state = get();
		let file = state.dashboards[providerName][folderName][fileName];
		let mutateFile = state.mutateFile;

		let updatedFile = {
			...file,
			data: {
				...file?.data,
				...updatedData,
			},
			status: "unsaved",
			timestamp: Date.now() / 1000,
		};

		mutateFile(providerName, folderName, fileName, updatedFile);
	},

	// region /fetch/

	fetchAllFiles: async () => {
		const state = get();

		let dashboardProviders = state.dashboardProviders;
		let generalProviders = state.generalProviders;
		if (!state || (!dashboardProviders && !generalProviders)) return;

		let providerURLs = [
			...new Set([...dashboardProviders, ...generalProviders]),
		];

		for (let provider of providerURLs) {
			if (!state.doesProviderServe(provider, "dashboards")) {
				continue;
			}

			let folders = state.getProviderElementList(
				provider,
				"dashboardsList"
			);

			try {
				let currentBoardStatus = state.getBoardStatus(
					state.activeProviderName,
					state.activeFolderName,
					state.activeFileName
				);
				if (currentBoardStatus?.includes("new")) {
					state.setActiveProviderName(null);
					state.setActiveFolderName(null);
					state.setActiveFileName(null);
				}
			} catch {}

			try {
				const response = await fetch(`${provider}/dashboards/fetch/`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ folders: folders }),
				});
				if (!response.ok) {
					throw new Error(
						`Failed to fetch dashboards from ${provider}`
					);
				}
				const fetchedFolders = await response.json();
				set((prev) => ({
					dashboards: {
						...prev.dashboards,
						[provider]: {
							...prev.dashboards[provider],
							...fetchedFolders,
						},
					},
				}));
			} catch (err) {
				console.error(err.message);
				throw err;
			}
		}
	},

	// region /persist/

	saveFile: async (providerName, folderName, fileName) => {
		const state = get();
		const file = state.dashboards[providerName][folderName][fileName];
		const mutateFile = state.mutateFile;

		if (!file) {
			console.error(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" not found in the store.`
			);
			return;
		}

		try {
			const response = await fetch(
				`${providerName}/dashboards/persist/`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						fileName,
						folder: folderName,
						data: file.data,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to save file to the server");
			}

			const updatedFile = await response.json();

			// Update the file in the store with the server's response
			mutateFile(providerName, folderName, fileName, updatedFile);
		} catch (err) {
			console.error("Error saving file:", err);
		}
	},

	// region /delete/

	deleteFile: async (providerName, folderName, fileName) => {
		const state = get();
		const file = state.dashboards[providerName][folderName][fileName];
		const mutateFile = state.mutateFile;

		if (!file) {
			console.error(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" not found in the store:`
			);
			return;
		}

		let updatedFile = { ...file, status: "newdeleted" };

		// If the file is new, simply mark it as deleted and exit
		if (file.status === "new") {
			mutateFile(providerName, folderName, fileName, updatedFile);

			console.log(
				`New File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" marked as deleted in the store.`
			);
			return;
		}

		// For all other files, proceed with the deletion logic
		try {
			const response = await fetch(`${providerName}/dashboards/delete/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fileName,
					folder: folderName,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to delete file on the server");
			}

			let newStatus =
				file.status === "unsaved" ? "unsaveddeleted" : "deleted";

			updatedFile.status = newStatus;

			// Update the file status in the store to "deleted"
			mutateFile(providerName, folderName, fileName, updatedFile);
		} catch (err) {
			console.error("Error deleting file:", err);
		}
	},

	// region /recover/

	recoverFile: async (providerName, folderName, fileName) => {
		const state = get();
		const file = state.dashboards[providerName][folderName][fileName];
		const mutateFile = state.mutateFile;

		if (!file) {
			console.error(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" not found in the store:`
			);
			return;
		}

		// Handle "newdeleted" or "unsaveddeleted" statuses
		if (file.status === "newdeleted" || file.status === "unsaveddeleted") {
			const restoredStatus = file.status.replace("deleted", "");
			let updatedFile = { ...file, status: restoredStatus };

			mutateFile(providerName, folderName, fileName, updatedFile);

			console.log(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" restored locally with status "${restoredStatus}".`
			);
		}

		if (file.status === "newdeleted") return;

		// Handle files that were deleted on the server (disk deletion by moving to .trash folder)
		try {
			const response = await fetch(
				`${providerName}/dashboards/recover/`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						fileName,
						folder: folderName,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to recover file on the server");
			}

			if (file.status === "unsaveddeleted") return;

			let updatedFile = { ...file, status: "disk" };

			// Update the file status in the store to "disk"
			mutateFile(providerName, folderName, fileName, updatedFile);

			console.log(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" successfully recovered from the server.`
			);
		} catch (err) {
			console.error("Error recovering file:", err);
		}
	},

	// region /rename/

	renameFile: async (providerName, folderName, fileName, newFileName) => {
		const state = get();
		const file = state.dashboards[providerName][folderName][fileName];

		if (!file || !file.status) {
			console.error(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" not found in the store:`
			);
			return;
		}

		if (file.status.includes("unsaved")) {
			console.error(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" was not eligible to be renamed:`
			);
			return;
		}

		// Handle "new" statuses
		if (file.status.includes("new")) {
			// Update the file in the store
			set((state) => {
				let updatedFiles = {
					...state.dashboards[providerName][folderName],
				};
				updatedFiles[newFileName] = {
					...updatedFiles[fileName],
				};
				delete updatedFiles[fileName];
				return {
					activeFileName: newFileName,
					dashboards: {
						...state.dashboards,
						[providerName]: {
							...state.dashboards[providerName],
							[folderName]: updatedFiles,
						},
					},
				};
			});

			console.log(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" renamed locally to "${newFileName}".`
			);
			return;
		}

		// Handle eligible non-new files
		try {
			const response = await fetch(`${providerName}/dashboards/rename/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					fileName,
					newFileName,
					folder: folderName,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to rename file on the server");
			}

			// Update the file in the store
			set((state) => {
				let updatedFiles = {
					...state.dashboards[providerName][folderName],
				};
				updatedFiles[newFileName] = {
					...updatedFiles[fileName],
				};
				delete updatedFiles[fileName];
				return {
					activeFileName: newFileName,
					dashboards: {
						...state.dashboards,
						[providerName]: {
							...state.dashboards[providerName],
							[folderName]: updatedFiles,
						},
					},
				};
			});
			console.log(
				`File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" successfully renamed to "${newFileName}" on the server.`
			);
		} catch (err) {
			console.error(
				`Error renaming File "${fileName}" from Folder "${folderName}" in Provider "${providerName}" to "${newFileName}":`,
				err
			);
		}
	},

	// region /reveal/*

	revealFolders: async (providerName, folders) => {
		folders = Array.isArray(folders) || !folders ? folders : [folders];
		let body = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ folders: folders }),
		};
		try {
			const response = await fetch(
				`${providerName}/dashboards/reveal/`,
				body
			);
			if (!response.ok) {
				throw new Error(`Failed to reveal the folder: ${folders}`);
			}
		} catch (err) {
			console.error(err.message);
			throw err;
		}
	},

	// region createOrCopyFile

	createOrCopyFile: (
		providerName,
		folderName,
		newFileName,
		originalFileName,
		customContent
	) => {
		set((state) => {
			// Check if the new file name already exists
			if (state.dashboards[providerName][folderName][newFileName]) {
				console.log(
					`A File named "${newFileName}" already exists in the Folder "${folderName}" in Provider "${providerName}".`
				);
				return state;
			}

			let updatedFiles = {
				...state.dashboards[providerName][folderName],
			};

			// If creating a copy
			if (originalFileName) {
				// Create a copy with a new name (prepend "COPY OF " with complex logic, already done in event handler)
				const originalFile =
					state.dashboards[providerName][folderName][
						originalFileName
					];
				let newFile = {
					...originalFile,
					status: "new",
					timestamp: Date.now() / 1000,
				};

				updatedFiles[newFileName] = newFile;
			} else {
				// If no active file, create a new file with placeholder content

				let newData = customContent || {
					grid: {
						rows: "7",
						columns: "18",
						gaps: "5",
					},
					slots: {},
				};

				updatedFiles[newFileName] = {
					folder: folderName,
					status: "new",
					timestamp: Date.now() / 1000,
					data: newData,
				};
			}

			return {
				activeFileName: newFileName,
				activeFolderName: folderName,
				activeProviderName: providerName,
				dashboards: {
					...state.dashboards,
					[providerName]: {
						...state.dashboards[providerName],
						[folderName]: { ...updatedFiles },
					},
				},
			};
		});
	},

	// region replaceFile

	replaceFile: (providerName, folderName, fileName, customContent) => {
		set((state) => {
			if (!state.dashboards[providerName][folderName][fileName]) {
				console.log(
					`A File named "${fileName}" does not exist in the Folder "${folderName}" in Provider "${providerName}".`
				);
				return state;
			}

			let updatedFiles = {
				...state.dashboards[providerName][folderName],
			};

			let newData = customContent || {
				grid: {
					rows: "7",
					columns: "18",
					gaps: "5",
				},
				slots: {},
			};

			updatedFiles[fileName] = {
				folder: folderName,
				status: "unsaved",
				timestamp: Date.now() / 1000,
				data: newData,
			};

			return {
				activeFileName: fileName,
				activeFolderName: folderName,
				activeProviderName: providerName,
				dashboards: {
					...state.dashboards,
					[providerName]: {
						...state.dashboards[providerName],
						[folderName]: { ...updatedFiles },
					},
				},
			};
		});
	},

	// region setGridInfo

	setGridInfo: (providerName, folderName, fileName, gridInfo) => {
		const state = get();
		const mutateFileData = state.mutateFileData;
		let file = state.dashboards[providerName][folderName][fileName];
		if (!file || !file.data || !file.data.slots) return;

		mutateFileData(providerName, folderName, fileName, {
			grid: {
				...file.data.grid,
				...gridInfo,
			},
		});
	},

	// region updateSlotData

	updateSlotData: (providerName, folderName, fileName, uuid, updatedData) => {
		let state = get();
		const mutateFileData = state.mutateFileData;
		let file = state.dashboards[providerName][folderName][fileName];
		if (!file || !file.data || !file.data.slots) return;

		const slot = file.data.slots[uuid];
		if (!slot) return;

		mutateFileData(providerName, folderName, fileName, {
			slots: {
				...file.data.slots,
				[uuid]: {
					...slot,
					...updatedData,
				},
			},
		});
	},

	// region addSlot

	addSlot(providerName, folderName, fileName, newSlot) {
		let state = get();
		const mutateFileData = state.mutateFileData;
		let file = state.dashboards[providerName][folderName][fileName];
		if (!file || !file.data || !file.data.slots) return;

		const uuid = crypto.randomUUID();

		mutateFileData(providerName, folderName, fileName, {
			slots: {
				...file.data.slots,
				[uuid]: newSlot,
			},
		});
	},

	// region deleteSlot

	deleteSlot(providerName, folderName, fileName, uuid) {
		let state = get();
		const mutateFileData = state.mutateFileData;
		let file = state.dashboards[providerName][folderName][fileName];
		if (!file || !file.data || !file.data.slots) return;

		let slots = file.data.slots;
		if (!slots) return;

		let updatedSlots = { ...slots };
		delete updatedSlots[uuid];

		mutateFileData(providerName, folderName, fileName, {
			slots: updatedSlots,
		});
	},

	// region populateSelection

	populateSelection(providerName, folderName, fileName, area, shift) {
		let state = get();
		const setSlotSelection = state.setSlotSelection;
		const appendSlotSelection = state.appendSlotSelection;
		let file = state.dashboards[providerName][folderName][fileName];
		if (!file || !file.data || !file.data.slots) return;

		let slots = file.data.slots;
		if (!slots) return;

		function areasOverlap(area1, area2) {
			return !(
				area1[2] <= area2[0] || // area1's bottom is above area2's top
				area1[0] >= area2[2] || // area1's top is below area2's bottom
				area1[3] <= area2[1] || // area1's right is left of area2's left
				area1[1] >= area2[3] || // area1's left is right of area2's right
				false
			);
		}

		let overlappingUUIDs = [];
		for (let uuid in slots) {
			let slotArea = slots[uuid].area.map(Number);
			if (areasOverlap(slotArea, area)) {
				overlappingUUIDs.push(uuid);
			}
		}

		if (shift) {
			appendSlotSelection(overlappingUUIDs);
		} else {
			setSlotSelection(overlappingUUIDs);
		}
	},

	// region getSlot

	getSlot: (providerName, folderName, fileName, uuid) => {
		const state = get();
		return state.dashboards[providerName][folderName][fileName]?.data
			?.slots[uuid];
	},

	// region getBoard

	getBoard: (providerName, folderName, fileName) => {
		const state = get();
		return state.dashboards[providerName][folderName][fileName];
	},

	// region getBoardStatus

	getBoardStatus: (providerName, folderName, fileName) => {
		const state = get();
		try {
			let file = state.dashboards[providerName][folderName][fileName];
			return file ? file["status"] : null;
		} catch {
			return null;
		}
	},

	// region getUnsavedFiles

	getUnsavedFiles: () => {
		const state = get();
		let dashboards = state.dashboards;
		let unsaved = [];

		for (let providerName of Object.keys(dashboards)) {
			for (let folderName of Object.keys(dashboards[providerName])) {
				for (let fileName of Object.keys(
					dashboards[providerName][folderName]
				)) {
					let file = dashboards[providerName][folderName][fileName];
					if (file.status === "unsaved" || file.status === "new") {
						unsaved.push([providerName, folderName, fileName]);
					}
				}
			}
		}

		return unsaved;
	},
}));

export default useBoardStore;
