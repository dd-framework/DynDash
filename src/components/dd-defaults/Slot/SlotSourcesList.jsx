import SidebarListBox from "../../global/sidebar/SidebarListBox.jsx";
import useSourcesStore from "../../../stores/useSourcesStore.jsx";

const SlotSourcesList = ({
	title,
	sources,
	removal,
	staticTypesList,
	staticComponent,
	staticSources,
}) => {
	// region Store Logic
	const getSourcesListWithInformation = useSourcesStore(
		(state) => state.getSourcesListWithInformation
	);

	let sourcesList = getSourcesListWithInformation(sources);

	if (sources?.length === 0) return;

	// region Rendering

	return (
		<SidebarListBox
			title={title}
			elementList={sourcesList}
			elementType={"source"}
			sortingEnabled={false}
			highlightingEnabled={true}
			removal={removal}
			staticTypesList={staticTypesList}
			staticComponent={staticComponent}
			staticSources={staticSources}
			classesForElements={"animate-wigglesmall"}
		/>
	);
};

export default SlotSourcesList;
