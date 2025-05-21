import SidebarListBox from "../../global/sidebar/SidebarListBox.jsx";
import useComponentStore from "../../../stores/useComponentStore.jsx";

const SlotComponentsList = ({
	title,
	components,
	removal,
	staticTypesList,
	staticComponent,
	staticSources,
}) => {
	// region Store Logic
	const getComponentsListWithInformation = useComponentStore(
		(state) => state.getComponentsListWithInformation
	);

	let componentsList = getComponentsListWithInformation(components);

	if (components?.length === 0) return;

	// region Rendering

	return (
		<SidebarListBox
			title={title}
			elementList={componentsList}
			elementType={"component"}
			sortingEnabled={false}
			highlightingEnabled={false}
			removal={removal}
			staticTypesList={staticTypesList}
			staticComponent={staticComponent}
			staticSources={staticSources}
			classesForElements={"animate-wigglesmall"}
		/>
	);
};

export default SlotComponentsList;
