import useAlertStore from "../../stores/useAlertStore";
import useInterfaceStore from "../../stores/useInterfaceStore";
import Alert from "./Alert";
import AlertButton from "./buttons/AlertButton";

const AlertPane = ({ providerName, folderName, fileName }) => {
	const alertMode = useInterfaceStore((state) => state.alertMode);
	const toggleAlertSeen = useAlertStore((state) => state.toggleAlertSeen);

	let allAlerts = useAlertStore((state) => state.alerts);
	let alertData = {};
	try {
		alertData = allAlerts[providerName][folderName][fileName];
	} catch {}

	// No alerts found, meaning not even the hide-toggle needs to be shown.
	if (!alertData || Object.keys(alertData)?.length < 1) {
		return;
	}

	let buttonOpacity = "opacity-100";
	if (Object.keys(alertData)?.every((alert) => alertData[alert].seen)) {
		buttonOpacity = "opacity-25";
	}

	return (
		<>
			<div
				className={`absolute top-0 left-0 flex flex-col items-center justify-center w-[25%] h-fit max-h-[95%] overflow-y-scroll z-[1002] backdrop-blur-md space-y-2 p-4 rounded-lg bg-red-500/40 border border-4 border-solid border-red-500/20 transition-transform duration-300 ease-in-out ${
					alertMode
						? "transform translate-x-[35px]" // adjust to 0px if it is supposed to overlap with the AlertButton
						: "transform -translate-x-full"
				}`}
			>
				{Object.keys(alertData)?.map((alertUUID) => {
					let seenFunction = () => {
						toggleAlertSeen(
							providerName,
							folderName,
							fileName,
							alertUUID
						);
					};
					return (
						<Alert
							alertContent={alertData[alertUUID]}
							seenFunction={seenFunction}
						/>
					);
				})}
			</div>

			<AlertButton additionalClasses={buttonOpacity} />
		</>
	);
};

export default AlertPane;
