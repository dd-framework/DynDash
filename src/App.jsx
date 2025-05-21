import React, { useEffect } from "react";
import Header from "./components/global/Header";
import FileGallery from "./components/gallery/FileGallery";
import BoardView from "./components/global/BoardView";
import Sidebar from "./components/global/sidebar/Sidebar";
import ToolModeIndicator from "./components/global/ToolModeIndicator";
import SelectionDeleteButton from "./components/global/buttons/SelectionDeleteButton";
import Modal from "./components/global/Modal";
import ColorPicker from "./components/global/ColorPicker";
import useBoardStore from "./stores/useBoardStore";
import useComponentStore from "./stores/useComponentStore";
import useConfigStore from "./stores/useConfigStore";
import useSourcesStore from "./stores/useSourcesStore";
import useTypeStore from "./stores/useTypeStore";
import useProviderStore from "./stores/useProviderStore";
import useColorStore from "./stores/useColorStore";

function App() {
	// region File Getting

	const activeFileName = useBoardStore((state) => state.activeFileName);
	const activeFolderName = useBoardStore((state) => state.activeFolderName);
	const activeProviderName = useBoardStore(
		(state) => state.activeProviderName
	);
	const fetchAllFiles = useBoardStore((state) => state.fetchAllFiles);
	const fetchAllComponents = useComponentStore(
		(state) => state.fetchAllComponents
	);
	const importAllComponents = useComponentStore(
		(state) => state.importAllComponents
	);

	const fetchAllProviderInformation = useProviderStore(
		(state) => state.fetchAllProviderInformation
	);

	// TODO find a better way to do this
	// This is unclean code that is not discarded because it currently enables the lazy loading of components.
	const importedComponents = useComponentStore(
		(state) => state.importedComponents
	);
	if (importedComponents && false) console.log("components used!");

	const fetchAllDataTypes = useTypeStore((state) => state.fetchAllDataTypes);
	const fetchAllSources = useSourcesStore((state) => state.fetchAllSources);
	const connectAllSources = useSourcesStore(
		(state) => state.connectAllSources
	);
	const disconnectAllSources = useSourcesStore(
		(state) => state.disconnectAllSources
	);

	const backgroundImage =
		useConfigStore(
			(state) => state?.dd_config?.dd_frontend?.backgroundImage
		) || "bg-blobs_01";

	const backgroundSize =
		useConfigStore(
			(state) => state?.dd_config?.dd_frontend?.backgroundSize
		) || "bg-cover";

	const killColorPicker = useColorStore((state) => state.killColorPicker);

	useEffect(() => {
		const fetchApplicationData = async () => {
			try {
				await fetchAllProviderInformation();
				await fetchAllFiles();
				await fetchAllComponents();
				await importAllComponents();
				await fetchAllDataTypes();
				await fetchAllSources();
				await connectAllSources();
			} catch (err) {
				console.error("An Error has occured while fetching:", err);
			}
		};

		fetchApplicationData();

		// Cleanup on unmount
		return () => {
			disconnectAllSources();
		};
	}, [
		fetchAllFiles,
		fetchAllComponents,
		importAllComponents,
		fetchAllDataTypes,
		fetchAllSources,
		fetchAllProviderInformation,
		connectAllSources,
		disconnectAllSources,
	]);

	useEffect(() => {
		const handleComponentsEvent = async (event) => {
			console.log("ddComponents Event received:", event.detail);
			await fetchAllProviderInformation();
			await fetchAllComponents();
			await importAllComponents();
		};
		document.addEventListener("ddComponents", handleComponentsEvent);

		const handleSourcesEvent = async (event) => {
			console.log("ddSources Event received:", event.detail);
			await fetchAllProviderInformation();
			await fetchAllDataTypes();
			await fetchAllSources();
			await connectAllSources();
		};
		document.addEventListener("ddSources", handleSourcesEvent);

		// Cleanup on unmount
		return () => {
			document.removeEventListener("ddComponents", handleComponentsEvent);
			document.removeEventListener("ddSources", handleSourcesEvent);
		};
	}, [
		connectAllSources,
		fetchAllComponents,
		fetchAllProviderInformation,
		fetchAllDataTypes,
		fetchAllSources,
		importAllComponents,
	]);

	// region Rendering

	return (
		<div
			className={`select-none ${backgroundImage} ${backgroundSize} min-h-screen text-white flex`}
			onClick={(e) => {
				killColorPicker();
			}}
		>
			<div className="flex-1">
				<Header />
				<main className="p-4">
					{activeFileName ? (
						<>
							<ToolModeIndicator additionalClasses="fixed left-6 bottom-4 px-3 py-3 rounded-full shadow-md shadow-black/20 bg-gray-400/40 backdrop-blur-md" />
							<SelectionDeleteButton />
							<Sidebar />
							<BoardView
								providerName={activeProviderName}
								folderName={activeFolderName}
								fileName={activeFileName}
								renderType={"detail"}
							/>
						</>
					) : (
						<FileGallery />
					)}
					<Modal />
					<ColorPicker />
				</main>
			</div>
		</div>
	);
}

export default App;
