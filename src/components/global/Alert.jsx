import useAlertStore from "../../stores/useAlertStore";

const Alert = ({ alertContent, seenFunction }) => {
	const setAlertHover = useAlertStore((state) => state.setAlertHover);

	if (!alertContent || Object.keys(alertContent) < 1) return;

	return (
		<div
			className={`${
				alertContent?.seen ? "opacity-50" : "opacity-100"
			} relative w-full flex flex-col rounded-lg p-2 space-y-1 bg-gray-800/20`}
			onClick={seenFunction}
			onMouseEnter={() => {
				setAlertHover(alertContent?.slot);
			}}
			onMouseLeave={() => {
				setAlertHover(null);
			}}
		>
			<span className={`flex justify-between w-full`}>
				<p className={`font-mono bg-gray-500/50 rounded-lg px-1`}>
					{alertContent?.title}
				</p>
				{alertContent?.urgency && (
					<p className={`font-mono bg-red-500/50 rounded-lg px-1`}>
						{alertContent?.urgency}
					</p>
				)}
			</span>
			<p className={`italic w-full max-h-[50px] overflow-y-scroll`}>
				{alertContent?.text}
			</p>
		</div>
	);
};

export default Alert;
