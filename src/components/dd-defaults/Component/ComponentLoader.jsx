import React, { useState, useEffect } from "react";
import ComponentMissingFallback from "./ComponentMissingFallback";
import BaseComponent from "./BaseComponent";
import DefaultSlotSettingsPane from "../SlotSettingsPane/DefaultSlotSettingsPane";
import useComponentStore from "../../../stores/useComponentStore";

const ComponentLoader = ({
	componentName,
	sourcesList,
	uuid,
	renderType,
	slotSettings,
	modifySlotSettings,
	sourcesRemoval,
}) => {
	const getComponent = useComponentStore((state) => state.getComponent);

	// region Flicker-Prevention Logic

	const [CurrentComponent, setCurrentComponent] = useState(null);
	const [nextComponent, setNextComponent] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (componentName) {
			setLoading(true);
			const loadComponent = async () => {
				try {
					let module = getComponent(componentName);
					let importedComponent = module?.default;

					let settingsPane =
						importedComponent.customSettingsPane ||
						DefaultSlotSettingsPane;

					let settingsMapper =
						importedComponent.settingsMapper || null;

					let Component = (
						<BaseComponent
							uuid={uuid}
							componentName={importedComponent.name}
							componentIcon={importedComponent.icon}
							SettingsPane={settingsPane}
							settingsMapper={settingsMapper}
							generalSettings={importedComponent.generalSettings}
							dataValidator={importedComponent.dataValidator}
							dataProcessor={importedComponent.dataProcessor}
							renderComponent={importedComponent.renderFunction}
							sourcesList={sourcesList}
							renderType={renderType}
							slotSettings={slotSettings}
							modifySlotSettings={modifySlotSettings}
							dataTypes={importedComponent.dataTypes}
							bypassEmpty={importedComponent.bypassEmpty}
							sourcesRemoval={sourcesRemoval}
						/>
					);

					setNextComponent(() => Component);
					setLoading(false);
				} catch {
					setNextComponent(() => (
						<ComponentMissingFallback
							componentName={componentName}
							renderType={renderType}
						/>
					));
					setLoading(false);
				}
			};
			loadComponent();
		} else {
			setCurrentComponent(null);
			setNextComponent(null);
		}
	}, [
		componentName,
		getComponent,
		modifySlotSettings,
		renderType,
		slotSettings,
		sourcesList,
		sourcesRemoval,
		uuid,
	]);

	useEffect(() => {
		if (!loading && nextComponent) {
			setCurrentComponent(() => nextComponent);
			setNextComponent(null);
		}
	}, [loading, nextComponent]);

	// region Rendering

	return CurrentComponent || null;
};

export default ComponentLoader;
