import { create } from "zustand";
import useProviderStore from "./useProviderStore";
import dd_types from "../dd_types.json";

const useTypeStore = create((set, get) => ({
	dataTypes: dd_types,

	typeProviders: useProviderStore.getState()?.typeProviders || [],
	generalProviders: useProviderStore.getState()?.generalProviders || [],
	doesProviderServe: useProviderStore.getState()?.doesProviderServe,

	// region fetchAllDataTypes

	fetchAllDataTypes: async () => {
		const state = get();
		let typeProviders = state.typeProviders;
		let generalProviders = state.generalProviders;
		if (!state || (!typeProviders && !generalProviders)) return;

		let providerURLs = [
			...new Set([...typeProviders, ...generalProviders]),
		];

		for (let provider of providerURLs) {
			try {
				if (!state.doesProviderServe(provider, "types")) {
					continue;
				}

				const response = await fetch(`${provider}/types`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});
				if (!response.ok) {
					throw new Error(
						`Failed to fetch Data Types from Source Provider ${provider}`
					);
				}

				const fetchedDataTypes = await response.json();

				set((prev) => ({
					...prev,
					dataTypes: {
						...prev.dataTypes,
						...fetchedDataTypes,
					},
				}));
			} catch (err) {
				console.error(err.message);
				continue;
			}
		}
	},

	// region getDataTypeObject

	getDataTypeObject: (dataType) => {
		const state = get();
		let dataTypeObject = state?.dataTypes[dataType];
		let defaultDataTypeObject = { ...state?.dataTypes["unknown"] };
		defaultDataTypeObject.explanation =
			defaultDataTypeObject.explanation.replaceAll(
				"PLACEHOLDER",
				`"${dataType}"`
			);

		return dataTypeObject || defaultDataTypeObject;
	},
}));

export default useTypeStore;
