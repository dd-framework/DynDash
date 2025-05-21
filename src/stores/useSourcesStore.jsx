import { create } from "zustand";
import useDataStore from "./useDataStore";
import useProviderStore from "./useProviderStore";

const useSourcesStore = create((set, get) => ({
	sources: {},
	wsSourceConnections: {},
	restSourceConnections: {},

	sourceProviders: useProviderStore.getState()?.sourceProviders || [],
	generalProviders: useProviderStore.getState()?.generalProviders || [],
	doesProviderServe: useProviderStore.getState()?.doesProviderServe,

	// region /sources/

	fetchAllSources: async () => {
		const state = get();
		let sourceProviders = state.sourceProviders;
		let generalProviders = state.generalProviders;
		if (!state || (!sourceProviders && !generalProviders)) return;

		let providerURLs = [
			...new Set([...sourceProviders, ...generalProviders]),
		];

		for (let sourceProvider of providerURLs) {
			try {
				if (!state.doesProviderServe(sourceProvider, "sources")) {
					continue;
				}

				const response = await fetch(`${sourceProvider}/sources/`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});
				if (!response.ok) {
					throw new Error(
						`Failed to fetch Sources from Source Provider ${sourceProvider}`
					);
				}

				const fetchedSources = await response.json();

				// Disconnect any to-be-deleted sources
				let disconnect = [];
				Object.keys(fetchedSources).forEach((key) => {
					if (fetchedSources[key] === null) {
						disconnect.push(key);
					}
				});

				if (disconnect.length > 0) {
					state.disconnectAllSources(disconnect);

					// Delete any existing data
					useDataStore.setState((prevState) => {
						let newState = prevState;

						Object.keys(prevState).forEach((key) => {
							if (disconnect?.includes(key)) {
								delete newState[key];
							}
						});

						return {
							...newState,
						};
					});
				}

				// Set the State with the new Sources
				set((prev) => {
					let newSources = {
						...prev.sources,
						...fetchedSources,
					};

					Object.keys(newSources).forEach((key) => {
						if (newSources[key] === null) {
							delete newSources[key];
						}
					});

					return {
						...prev,
						sources: newSources,
					};
				});
			} catch (err) {
				console.error(err.message);
				continue;
			}
		}
	},

	// region connectAllSources

	connectAllSources: () => {
		const state = get();
		const { sources } = state;

		Object.entries(sources).forEach(([sourceKey, source]) => {
			if (source?.connection?.protocol === "WS") {
				const { address, endpoint } = source.connection;

				const ws = new WebSocket(address);

				ws.onopen = () => {
					ws.send(JSON.stringify({ source: endpoint }));
				};

				ws.onmessage = (event) => {
					try {
						const response = JSON.parse(event.data);
						const { source, data: responseData, append } = response;

						if (source !== endpoint) {
							return;
						}

						useDataStore.setState((prevState) => {
							const currentData = prevState[endpoint] || {};
							let newData = {};

							if (append?.length > 0) {
								try {
									newData = {
										...currentData,
									};

									for (let type of Object.keys(
										responseData
									)) {
										if (append?.includes(type)) {
											let presentArray =
												newData[type] || [];
											let receivedArray =
												responseData[type] || [];
											let newArray =
												presentArray.concat(
													receivedArray
												);
											newData[type] = newArray;
										} else {
											newData[type] = responseData[type];
										}
									}
								} catch {
									console.log(
										`Appending to the Source ${endpoint} proved to cause issues.`
									);
								}
							} else {
								newData = {
									...currentData,
									...responseData,
								};
							}

							return {
								...prevState,
								[endpoint]: newData,
							};
						});
					} catch (err) {
						console.error("Error parsing WebSocket message:", err);
					}
				};

				ws.onerror = (err) => {
					console.error("WebSocket error for source", sourceKey, err);
				};

				set((prev) => ({
					...prev,
					wsSourceConnections: {
						...prev.wsSourceConnections,
						[sourceKey]: ws,
					},
				}));
			} else if (source?.connection?.protocol === "REST") {
				const { address, endpoint, interval, method, headers, body } =
					source.connection;

				let fetchMethod = method || "GET";
				let fetchHeaders = headers || {
					"Content-Type": "application/json",
				};
				let fetchFunction = interval ? setInterval : setTimeout;
				let fetchInterval = interval || 0;

				let requestJSON = {
					method: fetchMethod,
					headers: fetchHeaders,
				};

				if (body && method === "POST") requestJSON[body] = body;

				let connectionInterval = fetchFunction(async () => {
					try {
						const response = await fetch(
							`${address}/${endpoint}`,
							requestJSON
						);
						if (!response.ok) {
							throw new Error(
								`Failed to fetch the REST source: ${sourceKey}`
							);
						}

						const responseJSON = await response.json();

						useDataStore.setState((prevState) => {
							const currentData = prevState[endpoint] || {};
							return {
								...prevState,
								[endpoint]: {
									...currentData,
									...responseJSON,
								},
							};
						});
					} catch (err) {
						console.error(err.message);
					}
				}, fetchInterval);

				if (fetchFunction === setInterval) {
					set((prev) => ({
						...prev,
						restSourceConnections: {
							...prev.restSourceConnections,
							[sourceKey]: connectionInterval,
						},
					}));
				}
			}
		});
	},

	// region disconnectAllSources

	disconnectAllSources: (keys) => {
		const state = get();
		const { wsSourceConnections, restSourceConnections } = state;
		Object.values(wsSourceConnections).forEach((ws) => {
			// If keys are given (not-all mode), then check first
			if (keys?.length > 0 && !keys?.includes(ws)) {
				return;
			}
			if (
				ws.readyState === WebSocket.OPEN ||
				ws.readyState === WebSocket.CONNECTING
			) {
				ws.close();
			}
		});

		Object.values(restSourceConnections).forEach((rest) => {
			// If keys are given (not-all mode), then check first
			if (keys?.length > 0 && !keys?.includes(rest)) {
				return;
			}
			if (rest) {
				clearInterval(rest);
			}
		});

		set((prev) => ({
			...prev,
			restSourceConnections: {},
			wsSourceConnections: {},
		}));
	},

	// region getSourcesListWithInformation

	getSourcesListWithInformation: (keys) => {
		const state = get();
		if (!keys) keys = Object.keys(state.sources);

		return keys.map((sourceKey) => ({
			name: sourceKey,
			displayName: state.sources[sourceKey]?.name,
			information: state.sources[sourceKey]?.information,
			explanation: state.sources[sourceKey]?.explanation,
			dataTypes: state.sources[sourceKey]?.dataTypes,
		}));
	},
}));

export default useSourcesStore;
