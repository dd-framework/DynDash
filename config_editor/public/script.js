document.addEventListener("DOMContentLoaded", async () => {
	const listContainer = document.querySelector(".container ul");
	let config = {};
	let providersInfo = {};
	let providerArrays = ["dashboards", "components", "sources", "types"];
	let editedProviders = {};

	// region Setup

	async function fetchConfig() {
		const res = await fetch("/config");
		config = await res.json();
	}

	function getAllUniqueProviders() {
		const sets = providerArrays.map((key) => config.providers[key] || []);
		const inactive = config.providers.inactive || [];
		return [...new Set([...sets.flat(), ...inactive])].sort((a, b) =>
			a.localeCompare(b)
		);
	}

	async function fetchProvidersInfo(urls) {
		const info = {};
		await Promise.all(
			urls.map(async (url) => {
				try {
					const res = await fetch(url + "/info");
					info[url] = await res.json();
				} catch {
					info[url] = {
						name: "Unknown Provider",
						info: "No Information provided",
						provides: {},
						unavailable: true,
					};
				}
			})
		);
		return info;
	}

	// region UI Building
	function buildUI() {
		listContainer.innerHTML = "";
		const uniqueProviders = getAllUniqueProviders();

		uniqueProviders.forEach((url) => {
			let unavailable =
				providersInfo[url] && providersInfo[url].unavailable;

			const li = document.createElement("li");
			li.classList.add("provider-item");

			// region UI General Setup

			// Icon
			let icon = document.createElement("div");
			icon.classList.add("provider-icon");

			let img = document.createElement("img");
			img.src = url + "/icon";
			img.alt = "icon";
			img.onerror = () => {
				img.src = "/fallback.svg";
			};

			let del = document.createElement("p");
			del.classList.add("delete");
			del.textContent = "×";
			del.addEventListener("click", (e) => {
				e.stopPropagation();

				for (const key in config.providers) {
					const arr = config.providers[key];
					const idx = arr.indexOf(url);
					if (idx !== -1) {
						arr.splice(idx, 1);
					}
				}

				buildUI();
			});

			icon.appendChild(img);
			icon.appendChild(del);

			// Name
			let name = document.createElement("span");
			name.classList.add("provider-name");

			let displayName = document.createElement("p");
			displayName.textContent =
				(providersInfo[url] && providersInfo[url].name) ||
				"Unknown Provider";

			let displayURL = document.createElement("a");
			displayURL.textContent = url;
			displayURL.href = url;
			displayURL.target = "_blank";
			displayURL.rel = "noopener noreferrer";
			displayURL.addEventListener("click", (e) => {
				e.stopPropagation();
			});
			displayURL.classList.add("provider-url");

			name.appendChild(displayName);
			name.appendChild(displayURL);

			if (unavailable) {
				name.classList.add("unavailable");
			}

			// Info
			let info = document.createElement("span");
			info.classList.add("provider-info");
			info.appendChild(icon);
			info.appendChild(name);
			info.addEventListener("click", () => {
				alert(
					(providersInfo[url] && providersInfo[url].info) ||
						"No Description Provided"
				);
			});

			// region UI Provider Pills

			// Provided types
			const servesDiv = document.createElement("div");
			servesDiv.classList.add("provider-serves");

			providerArrays.forEach((type) => {
				const typeElement = document.createElement("span");
				typeElement.textContent = type[0].toUpperCase() + type.slice(1);
				typeElement.classList.add("provider-pill");

				// Opacity based on /info
				let provides =
					providersInfo[url] &&
					providersInfo[url].provides &&
					providersInfo[url].provides[type];
				let registered = config.providers[type].includes(url);

				typeElement.style.opacity = provides ? "1" : "0.25";

				// Click to toggle
				if (provides || unavailable || registered) {
					typeElement.addEventListener("click", () => {
						toggleProviderType(url, type);
						buildUI();
					});
				}

				// Cursor logic
				typeElement.style.cursor =
					provides || unavailable || registered
						? "pointer"
						: "not-allowed";

				// Color logic
				if (registered && !provides) {
					typeElement.style.backgroundColor = "rgb(230, 63, 63)";
				} else if (registered) {
					typeElement.style.backgroundColor = unavailable
						? "rgb(230, 63, 63)"
						: "green";
				} else {
					typeElement.style.backgroundColor =
						"rgba(255, 255, 255, 0.5)";
				}

				servesDiv.appendChild(typeElement);
			});

			li.appendChild(info);
			li.appendChild(servesDiv);

			listContainer.appendChild(li);
		});
	}

	// region Event Listeners

	// Toggle provider in config
	function toggleProviderType(url, type) {
		const array = config.providers[type];
		const index = array.indexOf(url);
		if (index === -1) {
			array.push(url);
		} else {
			array.splice(index, 1);
		}

		// Check if provider is present in any array
		let stillPresent = providerArrays.some((arrType) =>
			config.providers[arrType].includes(url)
		);

		// Ensure inactive array exists
		if (!config.providers.inactive) config.providers.inactive = [];

		const inactiveIndex = config.providers.inactive.indexOf(url);

		// Add to inactive if not already there, or remove if it is present elsewhere
		if (!stillPresent) {
			if (inactiveIndex === -1) config.providers.inactive.push(url);
		} else {
			if (inactiveIndex !== -1)
				config.providers.inactive.splice(inactiveIndex, 1);
		}
	}

	// Save button
	function setUpSaveButton() {
		let button = document.querySelector(".save-button");
		button.addEventListener("click", async () => {
			await fetch("/config", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(config),
			});
		});
	}

	function setUpAddField() {
		const addField = document.querySelector(".add-field");
		const addButton = addField.querySelector(".add-button");
		const addInput = addField.querySelector("input");

		addButton.addEventListener("click", () => {
			const value = addInput.value.trim();
			if (!value) return;

			if (!config.providers.inactive) config.providers.inactive = [];

			if (!config.providers.inactive.includes(value)) {
				config.providers.inactive.push(value);
				buildUI();
			}

			addInput.value = "";
		});
	}

	// region Startup

	await fetchConfig();
	let uniqueProviders = getAllUniqueProviders();
	providersInfo = await fetchProvidersInfo(uniqueProviders);
	buildUI();
	setUpSaveButton();
	setUpAddField();
});
