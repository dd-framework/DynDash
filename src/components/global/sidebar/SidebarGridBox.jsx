import React, { useState } from "react";
import SidebarBox from "./SidebarBox";
import useBoardStore from "../../../stores/useBoardStore";
import useConfigStore from "../../../stores/useConfigStore";
import useModalStore from "../../../stores/useModalStore";
import GridModeButton from "../buttons/GridModeButton";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const SidebarGridBox = () => {
	let keyboardShortcutCoulmnsDecrease = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.coulmnsDecrease
	) || ["⌘", "←"];

	let keyboardShortcutCoulmnsIncrease = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.coulmnsIncrease
	) || ["⌘", "→"];

	let keyboardShortcutRowsDecrease = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.rowsDecrease
	) || ["⌘", "↑"];

	let keyboardShortcutRowsIncrease = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.rowsIncrease
	) || ["⌘", "↓"];

	let keyboardShortcutGapsDecrease = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.gapsDecrease
	) || ["⌘", "."];

	let keyboardShortcutGapsIncrease = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.gapsIncrease
	) || ["⌘", "#"];

	// region Keyboard Shortcuts

	let handleColumnsDecrease = (e) => {
		handleInputChange("columns", (Number(localGrid.columns) || 1) - 1);
	};

	let handleColumnsIncrease = (e) => {
		handleInputChange("columns", (Number(localGrid.columns) || 0) + 1);
	};

	let handleRowsDecrease = (e) => {
		handleInputChange("rows", (Number(localGrid.rows) || 1) - 1);
	};

	let handleRowsIncrease = (e) => {
		handleInputChange("rows", (Number(localGrid.rows) || 1) + 1);
	};

	let handleGapsDecrease = (e) => {
		handleInputChange("gaps", (Number(localGrid.gaps) || 0) - 1);
	};

	let handleGapsIncrease = (e) => {
		handleInputChange("gaps", (Number(localGrid.gaps) || 0) + 1);
	};

	useToggleOnKeyPress(keyboardShortcutCoulmnsDecrease, handleColumnsDecrease);
	useToggleOnKeyPress(keyboardShortcutCoulmnsIncrease, handleColumnsIncrease);
	useToggleOnKeyPress(keyboardShortcutRowsDecrease, handleRowsDecrease);
	useToggleOnKeyPress(keyboardShortcutRowsIncrease, handleRowsIncrease);
	useToggleOnKeyPress(keyboardShortcutGapsDecrease, handleGapsDecrease);
	useToggleOnKeyPress(keyboardShortcutGapsIncrease, handleGapsIncrease);

	const customConfirm = useModalStore((state) => state.customConfirm);

	// region Grid Manipulation Logic

	const activeFileName = useBoardStore((state) => state.activeFileName);
	const activeFolderName = useBoardStore((state) => state.activeFolderName);
	const activeProviderName = useBoardStore(
		(state) => state.activeProviderName
	);
	const setGridInfo = useBoardStore((state) => state.setGridInfo);
	let gridInfo = useBoardStore(
		(state) =>
			state.dashboards[activeProviderName][activeFolderName][
				activeFileName
			]?.data?.grid
	);

	const [localGrid, setLocalGrid] = useState(gridInfo);

	// Sync gridInfo changes to local state (only when gridInfo changes, not on every render)
	React.useEffect(() => {
		if (gridInfo) setLocalGrid(gridInfo);
	}, [gridInfo]);

	if (/*!gridMode || */ !gridInfo) return null;

	const handleInputChange = (key, value) => {
		const numericValue = Math.max(
			key === "gaps" ? 0 : 1, // Minimum value for gap is 0, otherwise it's 1
			Number(value) || 0 // Default to 0 if the value is not a number
		);

		setLocalGrid((prev) => ({ ...prev, [key]: numericValue }));
		setGridInfo(activeProviderName, activeFolderName, activeFileName, {
			[key]: numericValue,
		});
	};

	// region Icons

	let getArrow = (direction) => {
		let arrows = {
			up: "M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18", // HEROICONS arrow-up
			down: "M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3", // HEROICONS arrow-down
			left: "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18", // HEROICONS arrow-left
			right: "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3", // HEROICONS arrow-right
			in: "M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25", // HEROICONS arrows-pointing-in
			out: "M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15", // HEROICONS arrows-pointing-out
		};

		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="size-3"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d={arrows[direction]}
				/>
			</svg>
		);
	};

	// region Event Handlers

	let titleOnClick = async (e) => {
		await customConfirm(
			"Grid Settings",
			`This Box allows user to change the underlying Grid of the Dashboard. It has controls for adding and removing Rows and Columns, as well as for increasing and decreasing the Gaps between them. It also enables the hiding or labelling of the Grid Cells.`
		);
	};

	// region Rendering

	let content = (
		<div className="grid grid-cols-2 gap-4">
			{/* Left Column */}
			<div className="flex flex-col justify-between">
				{/* Columns Input */}
				<div className="flex items-center">
					<button
						className="iconLeft relative w-6 h-10 bg-gray-700 hover:bg-gray-800 text-white rounded-l-md flex items-center justify-center transition-all"
						onClick={handleColumnsDecrease}
					>
						{getArrow("left")}
						<ToolTip keys={keyboardShortcutCoulmnsDecrease} />
					</button>
					<input
						type="text"
						value={localGrid.columns}
						onChange={(e) =>
							handleInputChange("columns", e.target.value)
						}
						className="w-16 text-center bg-gray-800/70 backdrop-blur-md border-none p-2 shadow-md"
					/>
					<button
						className="iconRight relative w-6 h-10 bg-gray-700 hover:bg-gray-800 text-white rounded-r-md flex items-center justify-center transition-all"
						onClick={handleColumnsIncrease}
					>
						{getArrow("right")}
						<ToolTip keys={keyboardShortcutCoulmnsIncrease} />
					</button>
				</div>

				{/* Gaps Input */}
				<div className="flex items-center mt-4">
					<button
						className="iconLeft relative w-6 h-10 bg-gray-700 hover:bg-gray-800 text-white rounded-l-md flex items-center justify-center transition-all"
						onClick={handleGapsDecrease}
					>
						{getArrow("in")}
						<ToolTip keys={keyboardShortcutGapsDecrease} />
					</button>
					<input
						type="text"
						value={localGrid.gaps}
						onChange={(e) =>
							handleInputChange("gaps", e.target.value)
						}
						className="w-16 text-center bg-gray-800/70 backdrop-blur-md border-none p-2 shadow-md"
					/>
					<button
						className="iconRight relative w-6 h-10 bg-gray-700 hover:bg-gray-800 text-white rounded-r-md flex items-center justify-center transition-all"
						onClick={handleGapsIncrease}
					>
						{getArrow("out")}
						<ToolTip keys={keyboardShortcutGapsIncrease} />
					</button>
				</div>
			</div>

			{/* Right Column */}
			<div className="flex flex-row justify-center items-center gap-4">
				{/* Rows Input */}
				<div className="flex flex-col justify-center items-center">
					<button
						className="iconUp relative w-16 h-7 bg-gray-700 hover:bg-gray-800 text-white rounded-t-md border-gray-600 flex items-center justify-center transition-all"
						onClick={handleRowsDecrease}
					>
						{getArrow("up")}
						<ToolTip keys={keyboardShortcutRowsDecrease} />
					</button>
					<input
						type="text"
						value={localGrid.rows}
						onChange={(e) =>
							handleInputChange("rows", e.target.value)
						}
						className="w-16 text-center bg-gray-800/70 backdrop-blur-md border-none p-2 shadow-md"
					/>
					<button
						className="iconDown relative w-16 h-7 bg-gray-700 hover:bg-gray-800 text-white rounded-b-md flex items-center justify-center transition-all"
						onClick={handleRowsIncrease}
					>
						{getArrow("down")}
						<ToolTip keys={keyboardShortcutRowsIncrease} />
					</button>
				</div>
				{/* Label Input */}
				<div className="flex flex-row justify-center items-center">
					<GridModeButton />
				</div>
			</div>
		</div>
	);

	return (
		<SidebarBox
			title={"Grid Settings"}
			onClick={titleOnClick}
			content={content}
		/>
	);
};

export default SidebarGridBox;
