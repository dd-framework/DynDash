import { create } from "zustand";

const useAlertStore = create((set, get) => ({
	alerts: {},
	alertHover: null,

	setAlertHover: (value) => set({ alertHover: value }),

	setAlert: (providerName, folderName, fileName, alert) => {
		set((state) => {
			let alerts = state.alerts || {};
			let provider = state.alerts[providerName] || {};
			let folder = state.alerts[providerName]?.[folderName] || {};
			let file =
				state.alerts[providerName]?.[folderName]?.[fileName] || {};

			file[alert?.uuid] = alert;

			return {
				...state,
				alerts: {
					...alerts,
					[providerName]: {
						...provider,
						[folderName]: {
							...folder,
							[fileName]: { ...file },
						},
					},
				},
			};
		});
	},

	toggleAlertSeen: (providerName, folderName, fileName, alertUUID) => {
		let state = get();
		try {
			let alertObject =
				state.alerts[providerName]?.[folderName]?.[fileName]?.[
					alertUUID
				];
			alertObject.seen = !alertObject.seen;
			state.setAlert(providerName, folderName, fileName, alertObject);
		} catch {
			console.log(
				`Unable to update Seen status of Alert ${alertUUID} in ${providerName}/${folderName}/${fileName}`
			);
		}
	},
}));

export default useAlertStore;
