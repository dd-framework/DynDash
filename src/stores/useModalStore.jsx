import { create } from "zustand";

const useModalStore = create((set) => ({
	modal: null,
	setModal: (modal) => set({ modal }),
	closeModal: () => set({ modal: null }),
	shake: false,
	setShake: (shake) => set({ shake }),

	// region General Modal Logic

	// General-purpose modal handler
	showModal: (modal) => {
		return new Promise((resolve) => {
			set({
				modal: {
					...modal,
					onConfirm: (value) => {
						resolve(value || true);
						set({ modal: null });
					},
					onCancel: () => {
						resolve(null);
						set({ modal: null });
					},
				},
			});
		});
	},

	// region Custom Confirm

	customConfirm: (title, message, options = {}) => {
		const {
			confirmText = "OK",
			cancelText = "Cancel",
			widthSettings = "w-full max-w-lg",
		} = options;
		return useModalStore.getState().showModal({
			title,
			message,
			confirmText,
			cancelText,
			widthSettings,
		});
	},

	// region Custom Prompt

	customPrompt: (title, message, options = {}) => {
		const {
			confirmText = "Submit",
			cancelText = "Cancel",
			defaultValue = "",
			widthSettings = "w-full max-w-lg",
		} = options;

		return useModalStore.getState().showModal({
			title,
			message,
			confirmText,
			cancelText,
			widthSettings,
			input: true,
			inputValue: defaultValue,
			setInputValue: (value) => {
				useModalStore.setState((state) => ({
					modal: {
						...state.modal,
						inputValue: value,
					},
				}));
			},
		});
	},

	// region Custom Option Picker
	customOptionPicker: (title, message, options = [], widthOverwrite = {}) => {
		const { widthSettings = "w-full max-w-lg" } = widthOverwrite;
		return useModalStore.getState().showModal({
			title,
			message,
			widthSettings,
			options,
			renderOptions: true,
		});
	},
}));

export default useModalStore;
