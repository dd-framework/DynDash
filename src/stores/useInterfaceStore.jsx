import { create } from "zustand";

const useInterfaceStore = create((set, get) => ({
	showDeleted: true,
	toolTipMode: null,
	toolBarMode: false,
	infoMode: null,
	alertMode: false,

	setShowDeleted: (value) => set({ showDeleted: value }),
	setToolTipMode: (value) => set({ toolTipMode: value }),
	setToolBarMode: (value) => set({ toolBarMode: value }),
	setInfoMode: (value) => set({ infoMode: value }),
	setAlertMode: (value) => set({ alertMode: value }),
}));

export default useInterfaceStore;
