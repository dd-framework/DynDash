import { create } from "zustand";
let dd_config_imported = require("../dd_config.json");

const useConfigStore = create((set, get) => ({
	dd_config: dd_config_imported,
}));

export default useConfigStore;
