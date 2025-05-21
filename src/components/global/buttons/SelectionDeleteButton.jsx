import useBoardStore from "../../../stores/useBoardStore";
import useModalStore from "../../../stores/useModalStore";
import useConfigStore from "../../../stores/useConfigStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const SelectionDeleteButton = () => {
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.deleteSelection
	) || ["⇧", "⌫"];

	// region ToolMode Logic

	let activeFileName = useBoardStore((state) => state.activeFileName);
	let activeFolderName = useBoardStore((state) => state.activeFolderName);
	let activeProviderName = useBoardStore((state) => state.activeProviderName);

	let toolMode = useBoardStore((state) => state.toolMode);
	let slotSelection = useBoardStore((state) => state.slotSelection);

	const customOptionPicker = useModalStore(
		(state) => state.customOptionPicker
	);

	let setSlotSelection = useBoardStore((state) => state.setSlotSelection);
	let deleteSlot = useBoardStore((state) => state.deleteSlot);
	let getSlot = useBoardStore((state) => state.getSlot);
	let updateSlotData = useBoardStore((state) => state.updateSlotData);

	let isShown = toolMode === "select" && slotSelection?.length > 0;

	// region Event Handling

	let deleteButtonOnClick = async () => {
		let multiple = slotSelection?.length > 1;

		const deleteAction = await customOptionPicker(
			"Specify Deletion Action",
			`Do you want to delete the Slot${multiple ? "s" : ""}, or clear ${
				multiple ? "their" : "its"
			} Contents?`,
			[
				`Delete Slot${multiple ? "s" : ""}`,
				"Clear Sources",
				"Clear Settings",
				`Clear Component${multiple ? "s" : ""}`,
				"Clear Sources, Settings, Components",
			]
		);

		if (!deleteAction) return;

		for (let i = 0; i < slotSelection?.length; i++) {
			if (deleteAction.includes("Delete")) {
				deleteSlot(
					activeProviderName,
					activeFolderName,
					activeFileName,
					slotSelection[i]
				);
				continue;
			}

			let updatedSlot = getSlot(
				activeProviderName,
				activeFolderName,
				activeFileName,
				slotSelection[i]
			);

			if (!updatedSlot) continue;

			if (deleteAction.includes("Sources")) {
				if (updatedSlot.sources) delete updatedSlot.sources;
			}

			if (deleteAction.includes("Component")) {
				if (updatedSlot.component) delete updatedSlot.component;
			}

			if (deleteAction.includes("Settings")) {
				if (updatedSlot.settings) delete updatedSlot.settings;
			}

			updateSlotData(
				activeProviderName,
				activeFolderName,
				activeFileName,
				slotSelection[i],
				updatedSlot
			);
		}

		if (deleteAction === "Delete") setSlotSelection([]);
	};

	useToggleOnKeyPress(keyboardShortcut, deleteButtonOnClick);

	// region Icons

	// HEROICONS trash
	let deleteIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-6 h-6"
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
		<div
			className={`fixed left-6 bottom-20 px-3 py-3 z-[1003] rounded-full shadow-md shadow-black/20 bg-red-500/70 hover:bg-red-500 hover:shadow-red-500/50 hover:ring-2 hover:ring-red-300 backdrop-blur-md transition duration-300 ease-in-out ${
				isShown ? "transform-none" : "-transform -translate-x-[200%]"
			}`}
			onClick={deleteButtonOnClick}
		>
			{deleteIcon}
			<ToolTip keys={keyboardShortcut} />
		</div>
	);
};

export default SelectionDeleteButton;
