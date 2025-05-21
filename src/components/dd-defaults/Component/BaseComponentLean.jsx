import DataTypeRibbon from "../../global/DataTypeRibbon";

const BaseComponentLean = ({
	componentName,
	componentIcon,
	renderType,
	dataTypes,
}) => {
	// region Sidebar Rendering

	// If the dd-Component is rendered in the sidebar of the application, only give back the most simple representation of what this dd-Component represents
	// This should not use any information that can change with store updates, as it is supposed merely represent the general idea of the dd-Component
	// The logic for sidebar rendering is located at the top of the file and not in the "Rendering Logic" region in order to prevent running the data logic for it
	if (renderType === "sidebar") {
		return (
			<div className="relative flex items-center space-x-2">
				{componentIcon}
				<p>{componentName}</p>
				<DataTypeRibbon
					dataTypes={dataTypes}
					additionalClasses={"absolute top-0 right-0"}
					keyContext={`sidebar-component-${componentName}`}
				/>
			</div>
		);
	}
};

export default BaseComponentLean;
