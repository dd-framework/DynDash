import { create } from "zustand";

const useDataStore = create((set, get) => ({
	anchorPosition: undefined,
	anchorMutation: undefined,
	anchorInitialColor: undefined,
	showColorPicker: false,

	setAnchorPosition: (value) => set({ anchorPosition: value }),
	setAnchorMutation: (value) => set({ anchorMutation: value }),
	setAnchorInitialColor: (value) => set({ anchorInitialColor: value }),
	setShowColorPicker: (value) => set({ showColorPicker: value }),

	killColorPicker: () =>
		set({
			anchorPosition: undefined,
			anchorMutation: undefined,
			anchorInitialColor: undefined,
			showColorPicker: false,
		}),
}));

export default useDataStore;
