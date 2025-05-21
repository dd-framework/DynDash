import { create } from "zustand";
import useProviderStore from "./useProviderStore";

const useComponentStore = create((set, get) => ({
	rawComponents: {},
	importedComponents: {},

	componentProviders: useProviderStore.getState()?.componentProviders || [],
	generalProviders: useProviderStore.getState()?.generalProviders || [],
	doesProviderServe: useProviderStore.getState()?.doesProviderServe,

	// region Getters

	getComponent: (name) => {
		const state = get();
		return state.importedComponents[name];
	},

	getComponentsList: () => {
		const state = get();
		return Object.keys(state.importedComponents);
	},

	getComponentsListWithInformation: (keys) => {
		const state = get();
		let importedComponents = state.importedComponents;
		if (!keys) keys = Object.keys(state.importedComponents);

		return keys.map((componentName) => ({
			name: componentName,
			displayName: importedComponents[componentName]?.default?.name,
			information:
				importedComponents[componentName]?.default?.information,
			explanation:
				importedComponents[componentName]?.default?.explanation,
			dataTypes: importedComponents[componentName]?.default?.dataTypes,
			icon: importedComponents[componentName]?.default?.icon,
			local: importedComponents[componentName]?.local,
		}));
	},

	// region fetchAllComponents

	fetchAllComponents: async () => {
		const state = get();
		let componentProviders = state.componentProviders;
		let generalProviders = state.generalProviders;
		if (!state || (!componentProviders && !generalProviders)) return;

		let providerURLs = [
			...new Set([...componentProviders, ...generalProviders]),
		];

		for (let componentProvider of providerURLs) {
			try {
				if (!state.doesProviderServe(componentProvider, "components")) {
					continue;
				}

				const response = await fetch(
					`${componentProvider}/components/`,
					{
						method: "GET",
						headers: { "Content-Type": "application/json" },
					}
				);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch Components from Component Provider ${componentProvider}`
					);
				}

				const fetchedComponents = await response.json();

				set((prev) => ({
					...prev,
					rawComponents: {
						...prev.rawComponents,
						...fetchedComponents,
					},
				}));
			} catch (err) {
				console.error(err.message);
				continue;
			}
		}
	},

	// region importAllComponents

	importAllComponents: async () => {
		const state = get();
		let rawComponents = state.rawComponents;

		for (let componentName in rawComponents) {
			try {
				let rawComponent = rawComponents[componentName];
				let module = undefined;

				if (rawComponent !== undefined) {
					let useLocal = `${rawComponent}`
						.replaceAll(" ", "")
						.toUpperCase()
						.startsWith("/*!USELOCAL!*/");

					// Attempt using local variant, if it fails, fallback to regular import
					if (useLocal) {
						try {
							module = await import(
								`../components/dd-components-local/${componentName}`
							);
							module.local = true;
						} catch {
							useLocal = false;
						}
					}

					// Regular import
					if (!useLocal) {
						let blob = new Blob([rawComponent], {
							type: "text/javascript",
						});

						let importableComponent = URL.createObjectURL(blob);
						module = await import(
							/* webpackIgnore: true */ importableComponent
						);

						URL.revokeObjectURL(importableComponent);
					}
				}

				set((state) => ({
					...state,
					importedComponents: {
						...state.importedComponents,
						[componentName]: module,
					},
				}));
			} catch (err) {
				console.error(err.message);
				continue;
			}
		}
	},
}));

export default useComponentStore;
