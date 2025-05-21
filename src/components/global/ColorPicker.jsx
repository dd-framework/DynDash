import useColorStore from "../../stores/useColorStore";
import { HexColorPicker } from "react-colorful";

const ColorPicker = () => {
	// region Modal Store Logic

	const anchorPosition = useColorStore((state) => state.anchorPosition);
	const anchorMutation = useColorStore((state) => state.anchorMutation);
	const anchorInitialColor = useColorStore(
		(state) => state.anchorInitialColor
	);
	const showColorPicker = useColorStore((state) => state.showColorPicker);

	if (!showColorPicker) return;

	// region Bounds Calculation
	const popupWidth = 150;
	const popupHeight = 150;
	const padding = 8;

	let top = anchorPosition?.top || 0;
	let left = (anchorPosition?.left || 0) + 30;

	if (left + popupWidth > window.innerWidth) {
		left = window.innerWidth - popupWidth - padding;
	}

	if (top + popupHeight > window.innerHeight) {
		top = window.innerHeight - popupHeight - padding;
	}

	if (top < 0) top = padding;
	if (left < 0) left = padding;

	// region Rendering
	return (
		<div
			className="absolute bg-gray-800 rounded shadow-lg z-[1010] flex items-center"
			onClick={(e) => e.stopPropagation()}
			style={{
				top: top,
				left: left,
			}}
		>
			<HexColorPicker
				color={anchorInitialColor}
				onChange={anchorMutation}
				style={{
					width: `${popupWidth}px`,
					height: `${popupHeight}px`,
				}}
			/>
		</div>
	);
};

export default ColorPicker;
