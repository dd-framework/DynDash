import { create } from "zustand";
import useConfigStore from "./useConfigStore";

const useRangeStore = create((set, get) => ({
	// region General Values
	startLimit: "0",
	endLimit: "$MAX",

	presets: {
		"Full Range": {
			start: "0",
			end: "$MAX",
		},
		...(useConfigStore.getState()?.dd_config?.dd_frontend?.dd_ranges || {}),
	},

	setStartLimit: (value) => set({ startLimit: value }),
	setEndLimit: (value) => set({ endLimit: value }),

	// region Presets

	setToPreset: (presetName) => {
		let state = get();
		let chosenPreset = state.presets[presetName];
		if (!chosenPreset) return;

		state.setStartLimit(chosenPreset?.start);
		state.setEndLimit(chosenPreset?.end);
	},

	getPresetNames: () => {
		let state = get();
		return Object.keys(state.presets) || [];
	},
}));

export default useRangeStore;
