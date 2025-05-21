// region Config

const stringify = require("json-stringify-pretty-compact").default;
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3002;

// region Setup

app.use(express.json());
app.use(cors());

// region Business Logic - Web Application

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// region Business Logic - Config Editing

// Add at the top
const CONFIG_PATH = path.join(__dirname, "../src/dd_config.json");

// GET route to fetch config
app.get("/config", (req, res) => {
	fs.readFile(CONFIG_PATH, "utf8", (err, data) => {
		if (err) {
			return res.status(500).json({ error: "Failed to read config." });
		}
		try {
			const json = JSON.parse(data);
			res.json(json);
		} catch (e) {
			res.status(500).json({ error: "Invalid JSON in config." });
		}
	});
});

// POST route to update config
app.post("/config", (req, res) => {
	const newConfig = req.body;
	fs.writeFile(
		CONFIG_PATH,
		stringify(newConfig, { maxLength: 80, indent: "\t" }),
		"utf8",
		(err) => {
			if (err) {
				return res
					.status(500)
					.json({ error: "Failed to write config." });
			}
			res.json({ success: true });
		}
	);
});

// region Servers

let restServer = app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}`)
);
