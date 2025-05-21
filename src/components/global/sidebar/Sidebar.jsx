import useInterfaceStore from "../../../stores/useInterfaceStore";
import useSourcesStore from "../../../stores/useSourcesStore";
import useConfigStore from "../../../stores/useConfigStore";
import useComponentStore from "../../../stores/useComponentStore";
import useBoardStore from "../../../stores/useBoardStore";
import useModalStore from "../../../stores/useModalStore";
import SidebarListBox from "./SidebarListBox";
import SidebarGridBox from "./SidebarGridBox";
import SidebarToolBox from "./SidebarToolBox";
import SidebarRangeBox from "./SidebarRangeBox";
import useToggleOnKeyPress from "../../../hooks/useToggleOnKeyPress";
import ToolTip from "../ToolTip";

const Sidebar = () => {
	let keyboardShortcut = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.toggleToolbar
	) || ["T"];

	// region Sidebar Features Logic

	const getComponentsListWithInformation = useComponentStore(
		(state) => state.getComponentsListWithInformation
	);

	const getSourcesListWithInformation = useSourcesStore(
		(state) => state.getSourcesListWithInformation
	);

	const sourcesList = getSourcesListWithInformation();
	const componentsList = getComponentsListWithInformation();

	// TODO find a better way to do this
	// This is unclean code that is not discarded because it currently enables the sidebar's refreshing when receiving new sources.
	const sources = useSourcesStore((state) => state.sources);
	if (sources && false) console.log("sources used!");

	// TODO find a better way to do this
	// This is unclean code that is not discarded because it currently enables the lazy loading of components.
	const importedComponents = useComponentStore(
		(state) => state.importedComponents
	);
	if (importedComponents && false) console.log("components used!");

	const settingsViewActive = useBoardStore(
		(state) => state.settingsViewActive
	);

	const infoMode = useInterfaceStore((state) => state.infoMode);

	const toolBarMode = useInterfaceStore((state) => state.toolBarMode);

	const setToolBarMode = useInterfaceStore((state) => state.setToolBarMode);

	let buttonOnClick = (e) => {
		setToolBarMode(!toolBarMode);
	};

	useToggleOnKeyPress(keyboardShortcut, buttonOnClick);

	const customConfirm = useModalStore((state) => state.customConfirm);

	// region Icons

	// HEROICONS arrow-left-start-on-rectangle
	let showIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="w-5 h-5 mr-0 inline align-middle mb-0.5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
			/>
		</svg>
	);

	// HEROICONS arrow-right-start-on-rectangle
	let hideIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="w-5 h-5 mr-0 inline align-middle mb-0.5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
			/>
		</svg>
	);

	// region Event Handlers

	let titleOnClickComponents = async (e) => {
		await customConfirm(
			"Components",
			<div className="space-y-2">
				<p>
					This Box Lists all of the available Components. Each of the
					Components can be dragged into a Slot. All Slots are able to
					hold exactly one Component.
				</p>
				<p>
					Components can be identified by their Icon and Name, as well
					as their short Description. Clicking on them reveals more
					information about the Component and possibly even about
					custom Settings available for it.
				</p>
				<p>
					Each Component has one or more Data Types, specifying what
					types of Data it can represent. Clicking on the Data Type
					will provide further information about it.
				</p>
				<p>
					Components are commonly provided by external Component
					Providers and will have a little badge next to them that's
					visible when the Info mode is not off. This badge commonly
					shows the Icon of the Component Provider and can be clicked
					for further information.
				</p>
			</div>
		);
	};

	let titleOnClickSources = async (e) => {
		await customConfirm(
			"Sources",
			<div className="space-y-2">
				<p>
					This Box Lists all of the available Sources. Each of the
					Sources can be dragged into a Slot. All Slots are able to
					hold none ore multiple Sources.
				</p>
				<p>
					Sources can be identified by their Name, as well as their
					short Description. Clicking on them reveals more information
					about the Source.
				</p>
				<p>
					Each Source has one or more Data Types, specifying what
					types of Data they provide. Clicking on the Data Type will
					provide further information about it.
				</p>
				<p>
					Sources are provided by external Source Providers. All
					Sources will have a little badge next to them that is
					visible when Tool Tips are active. This badge commonly shows
					the Icon of the Source Provider and can be clicked for
					further information.
				</p>
			</div>
		);
	};

	// region Rendering

	return (
		<>
			{/* Sidebar */}
			<div
				className={`fixed top-0 right-2 select-none w-80 p-4 h-full z-[1002] transition-transform duration-300 ease-in-out overflow-scroll ${
					toolBarMode
						? "transform-none"
						: "transform translate-x-full"
				}`}
			>
				<SidebarGridBox />

				<SidebarToolBox />

				<SidebarRangeBox />

				<SidebarListBox
					title={"Components"}
					onClick={titleOnClickComponents}
					elementList={componentsList}
					elementType={"component"}
					sortingEnabled={true}
					highlightingEnabled={infoMode || settingsViewActive}
				/>

				<SidebarListBox
					title={"Sources"}
					onClick={titleOnClickSources}
					elementList={sourcesList}
					elementType={"source"}
					sortingEnabled={true}
					highlightingEnabled={infoMode || settingsViewActive}
				/>
			</div>

			{/* Floating Button to Toggle Sidebar */}
			<button
				className="fixed right-6 bottom-4 z-[1003] select-none p-3 bg-green-500 text-white rounded-full shadow-md hover:shadow-xl transition-all duration-300 hover:shadow-blue-500/50 hover:ring-4 hover:ring-blue-500 hover:ring-purple-500 hover:ring-opacity-40"
				onClick={buttonOnClick}
				style={{ zIndex: 1003 }}
			>
				Tools {toolBarMode ? hideIcon : showIcon}
				<ToolTip keys={keyboardShortcut} />
			</button>
		</>
	);
};

export default Sidebar;
