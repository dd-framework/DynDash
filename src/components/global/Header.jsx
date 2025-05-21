import React, { useEffect } from "react";
import useBoardStore from "../../stores/useBoardStore";
import useAlertStore from "../../stores/useAlertStore";
import FileName from "./FileName";
import SaveButton from "./buttons/SaveButton";
import DeleteRecoverButton from "./buttons/multi/DeleteRecoverButton";
import DeletedVisibilityButton from "./buttons/DeletedVisibilityButton";
import CreateCopyButton from "./buttons/multi/CreateCopyButton";
import RenameSettingsButton from "./buttons/multi/RenameSettingsButton";
import ToolTipButton from "./buttons/ToolTipButton";
import InfoModeButton from "./buttons/InfoModeButton";
import UploadButton from "./buttons/UploadButton";
import NavigationButton from "./buttons/NavigationButton";
import ReloadButton from "./buttons/ReloadButton";

const Header = () => {
	// region State Evaluation Logic

	const activeFileName = useBoardStore((state) => state.activeFileName);
	const activeFolderName = useBoardStore((state) => state.activeFolderName);
	const activeProviderName = useBoardStore(
		(state) => state.activeProviderName
	);

	const setAlertHover = useAlertStore((state) => state.setAlertHover);
	const setSlotSelection = useBoardStore((state) => state.setSlotSelection);
	const setToolMode = useBoardStore((state) => state.setToolMode);
	const setActiveFileName = useBoardStore((state) => state.setActiveFileName);
	const setActiveFolderName = useBoardStore(
		(state) => state.setActiveFolderName
	);
	const setActiveProviderName = useBoardStore(
		(state) => state.setActiveProviderName
	);

	// TODO find a better way to do this
	// This is unclean code that is not discarded because it currently enables the functionality of getUnsavedFiles.
	let dashboards = useBoardStore((state) => state.dashboards);
	if (dashboards && false) console.log("folders used!");

	const getUnsavedFiles = useBoardStore((state) => state.getUnsavedFiles);
	const unsavedFiles = getUnsavedFiles();

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			if (unsavedFiles.length > 0) {
				event.preventDefault();
				event.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [unsavedFiles]);

	// region Rendering

	return (
		<div className="p-6 select-none">
			<div className="relative group backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg shadow-lg py-2 max-w-screen-xl mx-auto flex items-center">
				<div className="cursor-pointer p-4 flex flex-row w-[67%] max-w-[67%] overflow-hidden">
					<div>
						<h1 className="text-3xl font-bold text-white group relative">
							{/* Actual Application Title */}
							<span className="relative z-0">
								<span
									className="relative z-10 select-none"
									onClick={() => {
										setActiveFileName(null);
										setActiveFolderName(null);
										setActiveProviderName(null);
										setToolMode(null);
										setSlotSelection([]);
										setAlertHover(null);
									}}
								>
									DynDash
								</span>
								<span className="absolute inset-0 blur-md text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
							</span>
						</h1>
					</div>

					{/* Folder- and Filepath */}
					{activeFileName && (
						<FileName
							providerName={activeProviderName}
							folderName={activeFolderName}
							fileName={activeFileName}
							renderType="detail"
						/>
					)}
				</div>

				<div className="flex justify-end items-center space-x-4 p-4 w-[43%] min-w-[43%]">
					<RenameSettingsButton
						providerName={activeProviderName}
						folderName={activeFolderName}
						fileName={activeFileName}
					/>
					{activeFileName ? (
						<DeleteRecoverButton
							providerName={activeProviderName}
							folderName={activeFolderName}
							fileName={activeFileName}
						/>
					) : (
						<DeletedVisibilityButton />
					)}
					<SaveButton
						providerName={activeProviderName}
						folderName={activeFolderName}
						fileName={activeFileName}
					/>
					<CreateCopyButton
						providerName={activeProviderName}
						folderName={activeFolderName}
						fileName={activeFileName}
					/>
					<ToolTipButton />
					<InfoModeButton />
					<UploadButton />
					<ReloadButton />
					{activeFileName && <NavigationButton direction={"left"} />}
					{activeFileName && <NavigationButton direction={"right"} />}
				</div>
			</div>
		</div>
	);
};

export default Header;
