import React from "react";
import SidebarBox from "./SidebarBox";
import useBoardStore from "../../../stores/useBoardStore";
import useConfigStore from "../../../stores/useConfigStore";
import useModalStore from "../../../stores/useModalStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const SidebarToolBox = () => {
	const toolMode = useBoardStore((state) => state.toolMode);
	const setToolMode = useBoardStore((state) => state.setToolMode);

	const customConfirm = useModalStore((state) => state.customConfirm);

	let keyboardShortcutMoveSlot = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.moveSlot
	) || ["M"];

	let keyboardShortcutDrawSlot = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.drawSlot
	) || ["D"];

	let keyboardShortcutResizeSlot = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.resizeSlot
	) || ["R"];

	let keyboardShortcutSelectSlot = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.selectSlot
	) || ["S"];

	// region Icons

	const modes = [
		{
			name: "move",
			shortcut: keyboardShortcutMoveSlot,
			description: "Allows dragging around Slots",
			icon: (
				<path
					fill="currentColor"
					fillRule="evenodd"
					stroke="none"
					d="M 312 771 L 500 974 L 688 771 L 560.160034 771 L 560.160034 560.160034 L 770 560.160034 L 770 688 L 973 500 L 770 312 L 770 439.839966 L 560.160034 439.839966 L 560.160034 230 L 688 230 L 500 27 L 312 230 L 439.839996 230 L 439.839996 439.840027 L 229 439.840027 L 229 312 L 26 500 L 229 688 L 229 560.160034 L 439.839996 560.160034 L 439.839996 771 L 312 771 Z"
				/>
			),
		},
		{
			name: "draw",
			shortcut: keyboardShortcutDrawSlot,
			description: "Enables Drawing new Slots",
			icon: (
				<path
					fill="currentColor"
					fillRule="evenodd"
					stroke="none"
					d="M 243.083008 895.596924 L 53.417786 946.582214 L 104.403061 756.916992 L 243.083008 895.596924 Z M 858.985107 279.694824 L 270.954956 867.724976 L 132.275009 729.045044 L 720.305176 141.014893 L 858.985107 279.694824 Z M 283.976746 276.976746 L 417 276.976746 L 417 213.023254 L 283.976746 213.023254 L 283.976746 80 L 220.023254 80 L 220.023254 213.023254 L 87 213.023254 L 87 276.976746 L 220.023254 276.976746 L 220.023254 410 L 283.976746 410 L 283.976746 276.976746 Z M 877.339844 261.340149 L 946 192.679993 L 807.320007 54 L 738.659851 122.660156 L 877.339844 261.340149 Z"
				/>
			),
		},
		{
			name: "resize",
			shortcut: keyboardShortcutResizeSlot,
			description: "Controls for Resize, Rename, Remove",
			icon: (
				<path
					fill="currentColor"
					fillRule="evenodd"
					stroke="none"
					d="M 88.292892 88.292908 L 427.974487 101.324158 L 316.913391 212.385254 L 786.907654 682.379517 L 897.96875 571.318359 L 911 911 L 571.31842 897.96875 L 682.379517 786.907593 L 212.385269 316.913391 L 101.324158 427.974487 Z"
				/>
			),
		},
		{
			name: "select",
			shortcut: keyboardShortcutSelectSlot,
			description: "Allows for Selection and Bulk-Editing",
			icon: (
				<path
					fill="none"
					stroke="currentColor"
					strokeWidth="75"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeDasharray="150 112.5"
					strokeDashoffset="0"
					d="M 80 867 C 80 878.045715 88.954308 887 100 887 L 900 887 C 911.045715 887 920 878.045715 920 867 L 920 119 C 920 107.954285 911.045715 99 900 99 L 100 99 C 88.954308 99 80 107.954285 80 119 Z"
				/>
			),
		},
	];

	// region Slot Controls Logic

	let buttonOnClick = (e) => {
		let modeName = e?.target?.dataset?.tool;
		if (toolMode === modeName) {
			setToolMode(null);
		} else {
			setToolMode(modeName);
		}
	};

	// Handle keyboard shortcuts

	let createOnClickWrapper = (toolMode) => {
		return () => {
			let fakeEvent = { target: { dataset: { tool: toolMode } } };
			buttonOnClick(fakeEvent);
		};
	};

	useToggleOnKeyPress(keyboardShortcutMoveSlot, createOnClickWrapper("move"));
	useToggleOnKeyPress(keyboardShortcutDrawSlot, createOnClickWrapper("draw"));
	useToggleOnKeyPress(
		keyboardShortcutResizeSlot,
		createOnClickWrapper("resize")
	);
	useToggleOnKeyPress(
		keyboardShortcutSelectSlot,
		createOnClickWrapper("select")
	);

	// region Event Handlers

	let titleOnClick = async (e) => {
		await customConfirm(
			"Slot Tools",
			<div>
				<p>{`This Box contains the Tool Modes:`}</p>
				<ul>
					{modes.map((mode) => {
						return (
							<li className="flex pl-4 py-1">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 1000 1000"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-6 h-6 pointer-events-none"
								>
									{mode.icon}
								</svg>
								<p className="pl-2 w-[6em]">{`(${mode.shortcut.join(
									""
								)}: ${mode.name})`}</p>
								<p className="pl-2">{mode.description}</p>
							</li>
						);
					})}
				</ul>
			</div>
		);
	};

	// region Rendering

	// if (!gridMode) return null;

	const content = (
		<div className="flex flex-wrap justify-around mt-2">
			{modes.map((mode) => (
				<button
					key={mode.name}
					className={`relative flex items-center px-2 py-2 w-fit rounded-lg shadow-md transition-all ease-in-out duration-300 border-transparent ${
						toolMode === mode.name
							? "bg-blue-500 text-white hover:shadow-blue-500/50 hover:ring-4 hover:ring-blue-500"
							: "bg-gray-800/70 text-white hover:shadow-blue-500/50 hover:ring-4 hover:ring-blue-500"
					} box-border w-24`}
					data-tool={mode.name}
					onClick={buttonOnClick}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 1000 1000"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-6 h-6 pointer-events-none"
					>
						{mode.icon}
					</svg>

					<ToolTip keys={[mode.shortcut[0]]} />
				</button>
			))}
		</div>
	);

	return (
		<SidebarBox
			title={"Slot Tools"}
			onClick={titleOnClick}
			content={content}
		/>
	);
};

export default SidebarToolBox;
