import useBoardStore from "../../stores/useBoardStore";

const ToolModeIndicator = ({ additionalClasses }) => {
	// region ToolMode Logic

	let toolMode = useBoardStore((state) => state.toolMode);
	toolMode = toolMode ? toolMode : "default";

	const modes = {
		move: (
			<path
				fill="currentColor"
				fillRule="evenodd"
				stroke="none"
				d="M 312 771 L 500 974 L 688 771 L 560.160034 771 L 560.160034 560.160034 L 770 560.160034 L 770 688 L 973 500 L 770 312 L 770 439.839966 L 560.160034 439.839966 L 560.160034 230 L 688 230 L 500 27 L 312 230 L 439.839996 230 L 439.839996 439.840027 L 229 439.840027 L 229 312 L 26 500 L 229 688 L 229 560.160034 L 439.839996 560.160034 L 439.839996 771 L 312 771 Z"
			/>
		),

		draw: (
			<path
				fill="currentColor"
				fillRule="evenodd"
				stroke="none"
				d="M 243.083008 895.596924 L 53.417786 946.582214 L 104.403061 756.916992 L 243.083008 895.596924 Z M 858.985107 279.694824 L 270.954956 867.724976 L 132.275009 729.045044 L 720.305176 141.014893 L 858.985107 279.694824 Z M 283.976746 276.976746 L 417 276.976746 L 417 213.023254 L 283.976746 213.023254 L 283.976746 80 L 220.023254 80 L 220.023254 213.023254 L 87 213.023254 L 87 276.976746 L 220.023254 276.976746 L 220.023254 410 L 283.976746 410 L 283.976746 276.976746 Z M 877.339844 261.340149 L 946 192.679993 L 807.320007 54 L 738.659851 122.660156 L 877.339844 261.340149 Z"
			/>
		),

		resize: (
			<path
				fill="currentColor"
				fillRule="evenodd"
				stroke="none"
				d="M 88.292892 88.292908 L 427.974487 101.324158 L 316.913391 212.385254 L 786.907654 682.379517 L 897.96875 571.318359 L 911 911 L 571.31842 897.96875 L 682.379517 786.907593 L 212.385269 316.913391 L 101.324158 427.974487 Z"
			/>
		),

		select: (
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
	};

	let icon = modes[toolMode];

	// region Rendering

	const content = (
		<div
			className={`${additionalClasses} z-[1003] transition duration-300 ease-in-out ${
				toolMode !== "default"
					? "transform-none"
					: "-transform -translate-x-[200%]"
			}`}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 1000 1000"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				{icon}
			</svg>
		</div>
	);

	return content;
};

export default ToolModeIndicator;
