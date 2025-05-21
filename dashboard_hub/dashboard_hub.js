// region Config

const express = require("express");
const path = require("path");
const fs = require("fs");
const open = require("open");
const cors = require("cors");

let config = require("./config.json");
const app = express();
const PORT = process.env.PORT || config["port"] || 3001;

app.use(express.json());
app.use(cors());

// region Utility

// Finding all files of a given extension inside of a given directory
const findFilesOfType = (dir, extension) => {
	let results = [];
	const files = fs.readdirSync(dir, { withFileTypes: true });

	files.forEach((file) => {
		const filePath = path.join(dir, file.name);

		if (file.isDirectory()) {
			results = results.concat(findFilesOfType(filePath, extension));
		} else if (file.isFile() && file.name.endsWith(extension)) {
			results.push(filePath);
		}
	});

	return results;
};

// region Provider Logic

app.use("/icon", express.static(path.join(__dirname, "icon.svg")));

app.get("/info", (req, res) => {
	res.json({
		name: "DashboardProvider",
		info: "This Provider is a Dashboard Provider that can handle CRUD operations for Dashboards.",
		provides: {
			dashboards: true,
			components: false,
			sources: false,
			types: false,
		},
	});
});

// region /dashboards/

app.get("/dashboards/", (req, res) => {
	try {
		let folders = config["dashboard_locations"];
		res.json(folders);
	} catch (error) {
		res.json({ message: "Could not supply any dashboard locations!" });
	}
});

// region /reveal/

// Responsible for revealing all given folders, should there be any
app.post("/dashboards/reveal/", (req, res) => {
	try {
		let { folders } = req.body;

		// If folders are specified, find all specified folders that actually exist in the given category
		// Otherwise, just use the whole category
		if (folders) {
			folders = folders.filter((folder) => {
				return config["dashboard_locations"].includes(folder);
			});
		} else {
			folders = config["dashboard_locations"];
		}

		folders.forEach((folder) => {
			open(path.resolve(__dirname, folder));
		});

		res.json({
			message: `Revealed ${folders} Folder Locations from dashboard_locations!`,
		});
	} catch (error) {
		res.json({ message: "Could not find anything to reveal!" });
	}
});

// region /fetch/

// Responsible for providing all the Dashboard data saved in the given pathname, should there be any
app.post("/dashboards/fetch/", (req, res) => {
	try {
		let { folders } = req.body;
		let category = "dashboard_locations";

		// If folders are specified, find all specified folders that actually exist in the given category
		// Otherwise, just use the whole category
		if (folders) {
			folders = folders.filter((folder) => {
				return config[category].includes(folder);
			});
		} else {
			folders = config[category];
		}

		let foldersObject = {};

		folders.forEach((folder) => {
			const fullPath = path.resolve(__dirname, folder);
			const trashPath = path.join(fullPath, ".trash");
			let files = {};

			if (
				fs.existsSync(fullPath) &&
				fs.lstatSync(fullPath).isDirectory()
			) {
				const jsonFiles = findFilesOfType(fullPath, ".json");

				jsonFiles.forEach((file) => {
					const isTrash = file.startsWith(trashPath);
					const key = path.basename(file, ".json");
					const content = JSON.parse(fs.readFileSync(file, "utf8"));
					const fileStats = fs.statSync(file);

					files[key] = {
						folder: folder,
						status: isTrash ? "deleted" : "disk",
						timestamp: Math.floor(fileStats.mtime.getTime() / 1000),
						data: content,
					};
				});
			}

			foldersObject[folder] = files;
		});

		res.json(foldersObject);
	} catch (error) {
		console.error("Error occurred:", error);
		res.status(500).json({ message: "Could not retrieve data" });
	}
});

// region /persist/

// Responsible for persisting Dashboard data into a file on disk
app.post("/dashboards/persist/", (req, res) => {
	const { fileName, folder, data } = req.body;
	let category = "dashboard_locations";

	if (!fileName || !folder || !data || !config[category].includes(folder)) {
		return res
			.status(400)
			.json({ message: "Invalid file data provided in the request" });
	}

	try {
		const folderPath = path.resolve(__dirname, folder);

		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}

		const filePath = path.join(folderPath, `${fileName}.json`);
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

		const updatedFile = {
			folder,
			status: "disk",
			timestamp: Date.now() / 1000,
			data,
		};

		res.json(updatedFile);
	} catch (error) {
		console.error("Error saving file:", error);
		res.status(500).json({ message: "Failed to save file to the server" });
	}
});

// region /delete/

// Responsible for deleting a Dashboard file from disk by moving it into a neighbouring ".trash" folder
app.post("/dashboards/delete/", (req, res) => {
	const { fileName, folder } = req.body;
	let category = "dashboard_locations";

	if (!fileName || !folder || !config[category].includes(folder)) {
		return res
			.status(400)
			.json({ message: "Invalid file data provided in the request" });
	}

	try {
		const folderPath = path.resolve(__dirname, folder);
		const trashPath = path.join(folderPath, ".trash");

		if (!fs.existsSync(trashPath)) {
			fs.mkdirSync(trashPath, { recursive: true });
		}

		const filePath = path.join(folderPath, `${fileName}.json`);
		const trashFilePath = path.join(trashPath, `${fileName}.json`);

		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: "File not found" });
		}

		fs.renameSync(filePath, trashFilePath);

		res.json({ message: `File ${fileName} moved to .trash successfully` });
	} catch (error) {
		console.error("Error deleting file:", error);
		res.status(500).json({
			message: "Failed to delete file on the server",
		});
	}
});

// region /recover/

// Responsible for recovering a Dashboard file on disk by moving it into the parent folder of the currently containing ".trash" folder
app.post("/dashboards/recover/", (req, res) => {
	const { fileName, folder } = req.body;
	let category = "dashboard_locations";

	if (!fileName || !folder || !config[category].includes(folder)) {
		return res
			.status(400)
			.json({ message: "Invalid file data provided in the request" });
	}

	try {
		const folderPath = path.resolve(__dirname, folder); // path of the target folder
		const trashPath = path.join(folderPath, ".trash"); // path of the trash folder
		const filePath = path.join(folderPath, `${fileName}.json`); // target file path
		const trashFilePath = path.join(trashPath, `${fileName}.json`); // current file path

		if (!fs.existsSync(trashFilePath)) {
			return res
				.status(404)
				.json({ message: "File not found in .trash" });
		}

		// Moving works through renaming the file path
		fs.renameSync(trashFilePath, filePath);

		res.json({ message: `File ${fileName} recovered successfully` });
	} catch (error) {
		console.error("Error recovering file:", error);
		res.status(500).json({
			message: "Failed to recover file on the server",
		});
	}
});

// region /rename/

// Responsible for renaming a Dashboard file on disk by changing its path
app.post("/dashboards/rename/", (req, res) => {
	const { fileName, newFileName, folder } = req.body;
	let category = "dashboard_locations";

	if (
		!fileName ||
		!newFileName ||
		!folder ||
		!config[category].includes(folder)
	) {
		return res
			.status(400)
			.json({ message: "Invalid file data provided in the request" });
	}

	try {
		const folderPath = path.resolve(__dirname, folder);
		const filePath = path.join(folderPath, `${fileName}.json`);
		const newFilePath = path.join(folderPath, `${newFileName}.json`);

		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: "File not found" });
		}

		fs.renameSync(filePath, newFilePath);

		res.json({
			message: `File ${fileName} renamed to ${newFileName} successfully`,
		});
	} catch (error) {
		console.error("Error renaming file:", error);
		res.status(500).json({
			message: "Failed to rename file on the server",
		});
	}
});

// region Server

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
