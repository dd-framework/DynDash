import useSourcesStore from "../../../stores/useSourcesStore";
import useComponentStore from "../../../stores/useComponentStore";
import useModalStore from "../../../stores/useModalStore";
import useConfigStore from "../../../stores/useConfigStore";
import useTypeStore from "../../../stores/useTypeStore";
import useProviderStore from "../../../stores/useProviderStore";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const ReloadButton = () => {
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.reloadProviders
	) || ["⇧", "R"];

	// region File Reloading Logic

	const fetchAllComponents = useComponentStore(
		(state) => state.fetchAllComponents
	);

	const fetchAllDataTypes = useTypeStore((state) => state.fetchAllDataTypes);
	const fetchAllSources = useSourcesStore((state) => state.fetchAllSources);
	const connectAllSources = useSourcesStore(
		(state) => state.connectAllSources
	);
	const disconnectAllSources = useSourcesStore(
		(state) => state.disconnectAllSources
	);

	const importAllComponents = useComponentStore(
		(state) => state.importAllComponents
	);
	const fetchAllProviderInformation = useProviderStore(
		(state) => state.fetchAllProviderInformation
	);
	const customConfirm = useModalStore((state) => state.customConfirm);

	let reloadButtonOnClick = async () => {
		const confirmation = await customConfirm(
			"Reload?",
			`Are you sure you want to reload all Sources and Components that are currently present in the Application?`
		);
		if (confirmation) {
			await disconnectAllSources();
			await fetchAllProviderInformation();
			await fetchAllComponents();
			await importAllComponents();
			await fetchAllDataTypes();
			await fetchAllSources();
			await connectAllSources();
		}
	};

	useToggleOnKeyPress(keyboardShortcut, reloadButtonOnClick);

	// region Icons

	// HEROICONS arrow-path
	let reloadIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className="w-5 h-5 mr-0 inline align-middle"
		>
			<path
				fillRule="evenodd"
				d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
				clipRule="evenodd"
			/>
		</svg>
	);

	// region Rendering

	return (
		<button
			className="relative bg-gray-600/70 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400"
			onClick={reloadButtonOnClick}
		>
			{reloadIcon}
			<ToolTip keys={keyboardShortcut} />
		</button>
	);
};

export default ReloadButton;
