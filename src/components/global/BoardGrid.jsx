import React, { useState, useEffect } from "react";
import useBoardStore from "../../stores/useBoardStore";
import useThrottle from "../../hooks/useThrottle";

const BoardGrid = ({ providerName, folderName, fileName, renderType }) => {
	// region Dragging and Store Logic

	const gridMode = useBoardStore((state) => state.gridMode);
	const toolMode = useBoardStore((state) => state.toolMode);
	const globalDragging = useBoardStore((state) => state.dragging);
	const dragOffset = useBoardStore((state) => state.dragOffset);
	const dragArea = useBoardStore((state) => state.dragArea);
	const dragSlotInfo = useBoardStore((state) => state.dragSlotInfo);
	let grid = useBoardStore(
		(state) =>
			state.dashboards[providerName][folderName][fileName]?.data?.grid
	);
	const addSlot = useBoardStore((state) => state.addSlot);
	const updateSlotData = useBoardStore((state) => state.updateSlotData);
	const setSlotSelection = useBoardStore((state) => state.setSlotSelection);
	const populateSelection = useBoardStore((state) => state.populateSelection);

	const [dragging, setDragging] = useState(false);
	const [dragStart, setDragStart] = useState(null);
	const [currentDrag, setCurrentDrag] = useState(null);

	useEffect(() => {
		if (dragOffset) {
			setDragging(true);
		}
	}, [dragOffset]);

	const isFile = (e) => {
		let firstElement = e?.dataTransfer?.items[0];
		if (firstElement?.kind === "file") {
			return true;
		}
		return false;
	};

	// region Universal Logic

	const universalMouseEnter = (e, row, col) => {
		if (isFile(e)) return;
		if (!dragging) return;
		if (globalDragging === "sidebar") return;
		if (["draw", "select"].includes(toolMode) && !dragStart) {
			return;
		}
		setCurrentDrag({ row, col });
		if (toolMode === "select") {
			selectCalculator(e.shiftKey, undefined, { row, col });
		}
	};

	const universalMouseLeave = (e) => {
		if (isFile(e)) return;
		if (globalDragging === "sidebar") return;

		if (dragging) {
			const gridContainer = document.querySelector(".grid-container");
			const rect = gridContainer.getBoundingClientRect();

			const isWithinBounds =
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom;

			// On a confirmed leaving, treat a mouseLeave like a mouseUp / drop
			if (!isWithinBounds) {
				let f = getFunction("mouseUp");
				let f2 = getFunction("drop");
				if (f) f();
				if (f2) f2();
			}
		}
	};

	// region Drawing Logic

	const drawMouseUp = (e) => {
		if (isFile(e)) return;
		if (dragging && dragStart && currentDrag) {
			const startRow = Math.min(dragStart.row, currentDrag.row);
			const endRow = Math.max(dragStart.row, currentDrag.row);
			const startCol = Math.min(dragStart.col, currentDrag.col);
			const endCol = Math.max(dragStart.col, currentDrag.col);

			const newSlot = {
				name: "New Slot",
				area: [startRow, startCol, endRow + 1, endCol + 1],
			};

			addSlot(providerName, folderName, fileName, newSlot);

			setDragging(false);
			setDragStart(null);
			setCurrentDrag(null);
		}
	};

	const drawMouseDown = (e, row, col) => {
		if (isFile(e)) return;
		if (toolMode !== "draw") return;
		setDragging(true);
		setDragStart({ row, col });
		setCurrentDrag({ row, col });
	};

	// region Selection Logic

	const selectCalculator = (shift, fbDragStart, fbCurrentDrag) => {
		let selectDragStart = dragStart || fbDragStart; // Use fallbacks
		let selectCurrentDrag = currentDrag || fbCurrentDrag || fbDragStart; // Use fallbacks

		if (!selectDragStart || !selectCurrentDrag) return;
		const startRow = Math.min(selectDragStart.row, selectCurrentDrag.row);
		const endRow = Math.max(selectDragStart.row, selectCurrentDrag.row);
		const startCol = Math.min(selectDragStart.col, selectCurrentDrag.col);
		const endCol = Math.max(selectDragStart.col, selectCurrentDrag.col);

		let area = [startRow, startCol, endRow + 1, endCol + 1];
		populateSelection(providerName, folderName, fileName, area, shift);
	};

	const selectMouseUp = (e) => {
		if (isFile(e)) return;
		if (globalDragging === "sidebar") return;
		if (dragging && dragStart && currentDrag) {
			setDragging(false);
			setDragStart(null);
			setCurrentDrag(null);
		}
	};

	const selectMouseDown = (e, row, col) => {
		if (isFile(e)) return;
		if (toolMode !== "select") return;
		if (globalDragging === "sidebar") return;
		setDragging(true);
		setDragStart({ row, col });
		setCurrentDrag({ row, col });
		if (!e.shiftKey) setSlotSelection([]);
		selectCalculator(e.shiftKey, { row, col }, { row, col });
	};

	const throttledUniversalMouseEnter = useThrottle(universalMouseEnter, 100);

	const selectMouseMove = (e, row, col) => {
		if (globalDragging === "sidebar") return;
		throttledUniversalMouseEnter(e, row, col);
	};

	// region Moving Logic

	// necessary for re-entering the grid area
	const moveDragOver = (e) => {
		if (isFile(e)) return;
		setDragging(true);
	};

	const moveDrop = (e) => {
		if (isFile(e)) return;
		if (dragging) {
			if (!currentDrag) {
				setDragging(false);
				return;
			}

			let rowOffset = dragOffset ? dragOffset["rowOffset"] : 0;
			let colOffset = dragOffset ? dragOffset["colOffset"] : 0;

			let height = dragArea
				? parseInt(dragArea[2]) - parseInt(dragArea[0])
				: 1;

			let width = dragArea
				? parseInt(dragArea[3]) - parseInt(dragArea[1])
				: 1;

			let startRow = currentDrag?.row + rowOffset;
			startRow = Math.max(previewStartRow, 1);

			let endRow = previewStartRow + height;

			let startCol = currentDrag?.col + colOffset;
			startCol = Math.max(previewStartCol, 1);

			let endCol = previewStartCol + width;

			const newArea = {
				area: [startRow, startCol, endRow, endCol],
			};

			let folderName = dragSlotInfo?.folderName;
			let fileName = dragSlotInfo?.fileName;
			let uuid = dragSlotInfo?.uuid;

			if (dragSlotInfo)
				updateSlotData(
					providerName,
					folderName,
					fileName,
					uuid,
					newArea
				);

			setCurrentDrag(null);
			setDragging(false);
		}
	};

	// region Resizing Logic

	// necessary for re-entering the grid area
	const resizeDragOver = (e) => {
		if (isFile(e)) return;
		setDragging(true);
	};

	const resizeDrop = (e) => {
		if (isFile(e)) return;
		if (!dragging) return;
		if (!currentDrag) {
			setDragging(false);
			return;
		}

		let slotTopLeftRow = 1;
		let slotTopLeftCol = 1;
		slotTopLeftRow = dragArea[0];
		slotTopLeftCol = dragArea[1];

		let startRow = Math.min(slotTopLeftRow, currentDrag.row);
		startRow = Math.max(previewStartRow, 1);

		let endRow = Math.max(slotTopLeftRow, currentDrag.row);
		endRow = Math.min(previewEndRow, grid.rows);

		let startCol = Math.min(slotTopLeftCol, currentDrag.col);
		startCol = Math.max(previewStartCol, 1);

		let endCol = Math.max(slotTopLeftCol, currentDrag.col);
		endCol = Math.min(previewEndCol, grid.columns);

		let folderName = dragSlotInfo?.folderName;
		let fileName = dragSlotInfo?.fileName;
		let uuid = dragSlotInfo?.uuid;

		const newArea = {
			area: [startRow, startCol, endRow + 1, endCol + 1],
		};

		if (dragSlotInfo) {
			updateSlotData(providerName, folderName, fileName, uuid, newArea);
		}

		setDragging(false);
		setDragStart(null);
		setCurrentDrag(null);
	};

	// region Function Aggregator

	const getFunction = (functionName) => {
		let functions = {
			mouseUp: {
				draw: drawMouseUp,
				move: null, // handled through drop
				select: selectMouseUp,
				resize: null, // handled through drop
			},
			mouseDown: {
				draw: drawMouseDown,
				move: null, // initial mouseDown happens on non-"Grid Cell" element (Slot)
				select: selectMouseDown,
				resize: null, // initial mouseDown happens on non-"Grid Cell" element (SlotResizeHandle)
			},
			mouseEnter: {
				draw: universalMouseEnter,
				move: universalMouseEnter,
				select: universalMouseEnter,
				resize: universalMouseEnter,
			},
			mouseMove: {
				draw: null, // mouseEnter and mouseLeave are enough
				move: null, // wouldn't be triggered anyways due to the dragging
				select: selectMouseMove, // using only mouseEnter and mouseLeave would cause a delay in response
				resize: null, // wouldn't be triggered anyways due to the dragging
			},
			mouseLeave: {
				draw: universalMouseLeave,
				move: universalMouseLeave,
				select: universalMouseLeave,
				resize: universalMouseLeave,
			},
			dragOver: {
				draw: null, // no dragging is happening when using these Tools, and re-entering the grid area is irrelevant for them
				move: moveDragOver, // necessary for re-entering the grid area
				select: null, // no dragging is happening when using these Tools, and re-entering the grid area is irrelevant for them
				resize: resizeDragOver, // necessary for re-entering the grid area
			},
			dragEnter: {
				draw: null, // no dragging is happening when using these Tools
				move: universalMouseEnter,
				select: null, // no dragging is happening when using these Tools
				resize: universalMouseEnter,
			},
			drop: {
				draw: null, // no dropping is happening when using these Tools, the behaviour is handled through mouseUp
				move: moveDrop,
				select: null, // no dropping is happening when using these Tools, the behaviour is handled through mouseUp
				resize: resizeDrop,
			},
		};

		return functions[functionName][toolMode];
	};

	// region "Early"-Exit

	if (!gridMode || !grid) return;

	// region Preview Element Dimensions

	// Calculate the bounds of the selection preview depending on the toolMode
	let previewStartRow = 1;
	let previewEndRow = 1;
	let previewStartCol = 1;
	let previewEndCol = 1;
	let previewClass = "opacity-0";

	if (["draw", "select"].includes(toolMode) && currentDrag && dragStart) {
		previewStartRow = Math.min(dragStart?.row, currentDrag?.row);
		previewEndRow = Math.max(dragStart?.row, currentDrag?.row);
		previewStartCol = Math.min(dragStart?.col, currentDrag?.col);
		previewEndCol = Math.max(dragStart?.col, currentDrag?.col);

		previewClass =
			toolMode === "draw"
				? "bg-green-500/30 border-green-600"
				: "bg-purple-500/30 border-purple-600";
	} else if (["move"].includes(toolMode) && currentDrag) {
		let rowOffset = dragOffset ? dragOffset["rowOffset"] : 0;
		let colOffset = dragOffset ? dragOffset["colOffset"] : 0;

		let height = dragArea
			? parseInt(dragArea[2]) - parseInt(dragArea[0])
			: 1;

		let width = dragArea
			? parseInt(dragArea[3]) - parseInt(dragArea[1])
			: 1;

		previewStartRow = currentDrag?.row + rowOffset;
		previewStartRow = Math.max(previewStartRow, 1);

		previewEndRow = previewStartRow + height - 1;
		previewEndRow = Math.min(previewEndRow, grid.rows);

		previewStartCol = currentDrag?.col + colOffset;
		previewStartCol = Math.max(previewStartCol, 1);

		previewEndCol = previewStartCol + width - 1;
		previewEndCol = Math.min(previewEndCol, grid.columns);

		previewClass = "bg-purple-500/30 border-purple-600";
	} else if (["resize"].includes(toolMode) && currentDrag) {
		let slotTopLeftRow = 1;
		let slotTopLeftCol = 1;
		slotTopLeftRow = dragArea[0];
		slotTopLeftCol = dragArea[1];

		previewStartRow = Math.min(slotTopLeftRow, currentDrag.row);
		previewStartRow = Math.max(previewStartRow, 1);

		previewEndRow = Math.max(slotTopLeftRow, currentDrag.row);
		previewEndRow = Math.min(previewEndRow, grid.rows);

		previewStartCol = Math.min(slotTopLeftCol, currentDrag.col);
		previewStartCol = Math.max(previewStartCol, 1);

		previewEndCol = Math.max(slotTopLeftCol, currentDrag.col);
		previewEndCol = Math.min(previewEndCol, grid.columns);

		previewClass = "bg-purple-500/30 border-purple-600";
	}

	// region Rendering

	return (
		<div
			onMouseUp={getFunction("mouseUp")}
			onMouseLeave={getFunction("mouseLeave")}
			onDragOver={getFunction("dragOver")}
			onDragLeave={getFunction("mouseLeave")}
			onDrop={getFunction("drop")}
			className={`absolute inset-0 grid-container w-full h-full p-${
				renderType === "preview" ? "2" : "4"
			}`}
			style={{
				display: "grid",
				gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
				gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
				gap: `${grid.gaps}px`,
			}}
		>
			{/* Preview element for the selection */}
			{dragging && (
				<div
					className={`relative pointer-events-none w-full h-full ${previewClass} border-4 rounded-lg z-[7]`}
					style={{
						gridRowStart: previewStartRow,
						gridColumnStart: previewStartCol,
						gridRowEnd: previewEndRow + 1,
						gridColumnEnd: previewEndCol + 1,
					}}
				></div>
			)}

			{/* Grid cells */}
			{Array.from({ length: grid.rows * grid.columns }).map(
				(_, index) => {
					const row = Math.floor(index / grid.columns) + 1;
					const col = (index % grid.columns) + 1;

					return (
						<div
							key={`${row}-${col}-base`}
							className={`cell z-[3] flex justify-center items-center relative bg-gray-200 bg-opacity-10 backdrop-blur-md rounded-lg w-full h-full box-border border-2 border-white/5 hover:border-white/10 transition duration-300`}
							style={{
								gridRow: row,
								gridColumn: col,
							}}
						>
							{/* Cell Label */}
							{gridMode === "grid-labelled" && (
								<p className="opacity-10 select-none">{`r${row} c${col}`}</p>
							)}
						</div>
					);
				}
			)}

			{/* Invisible, higher-z cell for interaction */}
			{(toolMode === "draw" ||
				(toolMode === "select" && globalDragging !== "sidebar") ||
				(toolMode === "move" && dragging) ||
				(toolMode === "resize" && dragging)) &&
				Array.from({ length: grid.rows * grid.columns }).map(
					(_, index) => {
						const row = Math.floor(index / grid.columns) + 1;
						const col = (index % grid.columns) + 1;

						return (
							<div
								key={`${row}-${col}-overlay`}
								className={`cell z-[6] flex justify-center items-center relative rounded-lg w-full h-full box-border border-2 border-white/0`}
								style={{
									gridRow: row,
									gridColumn: col,
								}}
								onMouseDown={(e) => {
									let f = getFunction("mouseDown");
									if (f) f(e, row, col);
								}}
								onMouseEnter={(e) => {
									let f = getFunction("mouseEnter");
									if (f) f(e, row, col);
								}}
								onMouseMove={(e) => {
									let f = getFunction("mouseMove");
									if (f) f(e, row, col);
								}}
								onDragEnter={(e) => {
									let f = getFunction("dragEnter");
									if (f) f(e, row, col);
								}}
							></div>
						);
					}
				)}
		</div>
	);
};

export default BoardGrid;
