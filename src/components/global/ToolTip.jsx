import useInterfaceStore from "../../stores/useInterfaceStore";

const ToolTip = ({ keys }) => {
	// region Store Logic

	const toolTipMode = useInterfaceStore((state) => state.toolTipMode);
	if (toolTipMode !== "keys" || keys?.length === 0) return;

	// region Rendering

	const content = (
		<div
			className={`absolute top-0 right-0 w-fit h-fit space-x-1 flex flex-row justify-end items-center px-1 text-sm bg-gray-500 text-white rounded-md`}
			style={{
				transform: "translateX(45%) translateY(-35%)",
			}}
		>
			{keys.join("")}
		</div>
	);

	return content;
};

export default ToolTip;
