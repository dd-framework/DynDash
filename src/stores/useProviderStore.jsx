import { create } from "zustand";
import useConfigStore from "./useConfigStore";

const useProviderStore = create((set, get) => ({
	providers: {},

	componentProviders:
		useConfigStore.getState()?.dd_config?.providers?.components || [],

	sourceProviders:
		useConfigStore.getState()?.dd_config?.providers?.sources || [],

	typeProviders: useConfigStore.getState()?.dd_config?.providers?.types || [],

	dashboardProviders:
		useConfigStore.getState()?.dd_config?.providers?.dashboards || [],

	// region getAllProviderURLs

	getAllProviderURLs: () => {
		const state = get();
		let componentProviders = state.componentProviders;
		let sourceProviders = state.sourceProviders;
		let typeProviders = state.typeProviders;
		let dashboardProviders = state.dashboardProviders;

		return [
			...new Set([
				...componentProviders,
				...sourceProviders,
				...typeProviders,
				...dashboardProviders,
			]),
		];
	},

	// region fetchAllProviderInformation

	fetchAllProviderInformation: async () => {
		const state = get();
		let getAllProviderURLs = state.getAllProviderURLs;
		if (!state) return;
		let providerURLs = getAllProviderURLs();

		for (let provider of providerURLs) {
			try {
				let hasSources = state.sourceProviders.includes(provider);
				let hasComponents = state.componentProviders.includes(provider);
				let hasTypes = state.typeProviders.includes(provider);
				let hasDashboards = state.dashboardProviders.includes(provider);

				// Get general provider information
				const responseInfo = await fetch(`${provider}/info/`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});
				if (!responseInfo.ok) {
					throw new Error(
						`Failed to fetch Name from Provider ${provider}`
					);
				}

				// Get Icon
				const responseIcon = await fetch(`${provider}/icon`, {
					method: "GET",
				});
				if (!responseIcon.ok) {
					throw new Error(
						`Failed to fetch Icon from Provider ${provider}`
					);
				}

				// Accumulating values for the provider object in the store
				const fetchedInfo = await responseInfo.json();
				const nameText = fetchedInfo?.name;
				const infoText = fetchedInfo?.info;
				const provides = fetchedInfo?.provides;
				const fetchedIcon = await responseIcon.text();

				// Making sure that not only was the provider registered as an XYZ provider,
				// but that it also advertises itself as one, before attempting to fetch
				hasSources = hasSources && provides?.sources;
				hasComponents = hasComponents && provides?.components;
				hasTypes = hasTypes && provides?.types;
				hasDashboards = hasDashboards && provides?.dashboards;

				// Possibly get sources
				const responseSources = hasSources
					? await fetch(`${provider}/sources/`, {
							method: "GET",
							headers: { "Content-Type": "application/json" },
					  })
					: { ok: true };
				if (!responseSources.ok) {
					throw new Error(
						`Failed to fetch Sources from Source Provider ${provider}`
					);
				}

				// Possibly get components
				let responseComponents = hasComponents
					? await fetch(`${provider}/components/`, {
							method: "GET",
							headers: { "Content-Type": "application/json" },
					  })
					: { ok: true };
				if (!responseComponents.ok) {
					throw new Error(
						`Failed to fetch Components from Component Provider ${provider}`
					);
				}

				// Possibly get types
				let responseTypes = hasTypes
					? await fetch(`${provider}/types/`, {
							method: "GET",
							headers: { "Content-Type": "application/json" },
					  })
					: { ok: true };
				if (!responseTypes.ok) {
					throw new Error(
						`Failed to fetch Types from Type Provider ${provider}`
					);
				}

				// Possibly get dashboards
				let responseDashboards = hasDashboards
					? await fetch(`${provider}/dashboards/`, {
							method: "GET",
							headers: { "Content-Type": "application/json" },
					  })
					: { ok: true };
				if (!responseTypes.ok) {
					throw new Error(
						`Failed to fetch Dashboards from Type Provider ${provider}`
					);
				}

				// Create a registry of all the sources/components/types belonging to this provider
				let newLists = {};
				if (hasSources) {
					let fetchedList = await responseSources.json();
					newLists.sourcesList = Object.keys(fetchedList);
				}
				if (hasComponents) {
					let fetchedList = await responseComponents.json();
					newLists.componentsList = Object.keys(fetchedList);
				}
				if (hasTypes) {
					let fetchedList = await responseTypes.json();
					newLists.typesList = Object.keys(fetchedList);
				}
				if (hasDashboards) {
					let fetchedList = await responseDashboards.json();
					newLists.dashboardsList = fetchedList;
				}

				set((prev) => ({
					...prev,
					providers: {
						...prev.providers,
						[provider]: {
							...prev.providers[provider],
							...newLists,
							name: nameText,
							info: infoText,
							icon: fetchedIcon,
							provides: provides,
						},
					},
				}));
			} catch (err) {
				console.error(err.message);
			}
		}
	},

	// region getProviderOfElement

	getProviderOfElement: (elementName, elementList) => {
		const state = get();

		const providerEntry = Object.entries(state.providers).find(
			([providerName, provider]) =>
				provider[elementList]?.includes(`${elementName}`)
		);

		return providerEntry ? providerEntry[0] : null;
	},

	// region getProviderElementList

	getProviderElementList: (providerName, elementList) => {
		try {
			const providers = get()?.providers || {};
			return providers[providerName]?.[elementList];
		} catch {
			return [];
		}
	},

	// region doesProviderServe

	doesProviderServe: (providerName, servable) => {
		const providers = get()?.providers || {};
		return providers[providerName]?.provides?.[servable];
	},

	// region getProviderRegistrations

	getProviderRegistrations: (providerName) => {
		const state = get();
		let registrationLists = {
			dashboards: state.dashboardProviders,
			components: state.componentProviders,
			sources: state.sourceProviders,
			types: state.typeProviders,
		};

		let offeringsMap = {};

		for (let listName of Object.keys(registrationLists)) {
			offeringsMap[listName] =
				registrationLists[listName]?.includes(providerName);
		}

		return offeringsMap;
	},
}));

export default useProviderStore;
