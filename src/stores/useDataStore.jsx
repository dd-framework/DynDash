import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const useDataStore = create(
	subscribeWithSelector((set, get) => ({
		getDataFromSources: (sources) => {
			const state = get();
			if (!sources || sources?.length === 0) return {};

			return Object.fromEntries(
				Object.entries(state).filter(([key]) => sources?.includes(key))
			);
		},
	}))
);

export default useDataStore;
