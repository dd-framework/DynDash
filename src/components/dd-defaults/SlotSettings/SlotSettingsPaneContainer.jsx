const SlotSettingsPaneContainer = ({ textareaVisible }) => {
	// region Layout Calculations

	let columns = textareaVisible ? 2 : 4;
	let minWidth = textareaVisible ? "50%" : "min-content";
	let styles = `
		#slot-settings-detail .componentPanel {
			grid-template-columns: repeat(${columns}, minmax(0, 1fr));
		}

		#slot-settings-detail .componentPanelElement {
			min-width: ${minWidth};
		}
	`;

	// region Rendering

	return (
		<div id="slot-settings-detail" className="w-full">
			<div className="w-full h-full items-center justify-center bg-gray-800 text-white only:flex hidden">
				{/* The style shouldn't really be here, but rather one level up, but then the only:flex logic breaks... */}
				{/* But since the style is already not best practice, i'm placing it here */}
				<style>{styles}</style>{" "}
				<p className="text-lg">Loading Settings...</p>
			</div>
		</div>
	);
};

export default SlotSettingsPaneContainer;
