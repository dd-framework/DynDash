const SideLabel = ({ content, side }) => {
	if (!content) return null;

	let sideString = `${side}`.toUpperCase();
	let styleObject = {};

	if (["L", "LEFT"].includes(sideString)) {
		styleObject = {
			bottom: "50%",
			left: "0",
			transform: "translateX(-100%) translateY(50%)",
		};
	} else if (["R", "RIGHT"].includes(sideString)) {
		styleObject = {
			bottom: "50%",
			right: "0",
			transform: "translateX(100%) translateY(50%)",
		};
	} else if (["T", "TOP", "U", "UP"].includes(sideString)) {
		styleObject = {
			top: "0",
			left: "50%",
			transform: "translateX(-50%) translateY(-100%)",
		};
	} else if (["B", "BOTTOM", "D", "DOWN"].includes(sideString)) {
		styleObject = {
			bottom: "0",
			left: "50%",
			transform: "translateX(-50%) translateY(100%)",
		};
	}
	return (
		<div
			className="absolute w-fit h-fit space-x-1 flex flex-row justify-end items-center cursor-default"
			style={styleObject}
		>
			{content}
		</div>
	);
};

export default SideLabel;
