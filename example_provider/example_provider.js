// region Config

const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4451;
const clients = new Map();

app.use(express.json());
app.use(cors());

let dataTypes = require("./types.json");
let sources = require("./sources.json");
let data = require("./data.json");

// region REST Routes

app.use("/icon", express.static(path.join(__dirname, "icon.svg")));

app.use("/info", (req, res) => {
	res.json({
		name: "ExampleProvider",
		info: "This is simply an example Provider that is used to showcase how to set these up",
		provides: {
			dashboards: false,
			components: false,
			sources: true,
			types: true,
		},
	});
});

app.get("/types", (req, res) => {
	res.json(dataTypes);
});

app.get("/sources", (req, res) => {
	res.json(sources);
});

app.get("/sources/data", (req, res) => {
	res.json(data);
});

app.get("/sources/data/:key(*)", (req, res) => {
	let key = req.params.key;

	if (sources[key] && data[key]) {
		res.status(200).send(JSON.stringify(data[key])).end();
	} else {
		res.status(404);
	}
});

// region Servers and WebSockets

let restServer = app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}`)
);

let wsServer = new WebSocket.Server({ server: restServer });

wsServer.on("connection", (ws) => {
	console.log("New WebSocket connection");

	ws.on("message", (message) => {
		try {
			const { source } = JSON.parse(message);

			if (sources[source]) {
				if (data[source]) {
					console.log(`Client requested source: ${source}`);
					clients.set(ws, source);

					ws.send(
						JSON.stringify({
							status: "connected",
							source,
							data: data[source],
						})
					);
				} else {
					ws.send(
						JSON.stringify({
							error: `No data available for source "${source}".`,
						})
					);
				}
			} else {
				ws.send(
					JSON.stringify({
						error: `Source "${source}" not found.`,
					})
				);
			}
		} catch (err) {
			console.error("Invalid message format:", err);
			ws.send(JSON.stringify({ error: "Invalid message format." }));
		}
	});

	ws.on("close", () => {
		console.log("WebSocket connection closed");
		clients.delete(ws);
	});
});

function broadcastUpdates(source, updatedData, append = []) {
	for (const [ws, requestedSource] of clients.entries()) {
		// Only send updates to clients that requested this source
		if (requestedSource === source && ws.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({
					status: "updated",
					source: source,
					data: updatedData,
					append: append, // append can be filled with Data Type names of any array-based Data Types in updatedData. This will cause their contents to be appended to the Data in the DynDash, instead of replacing it.
				})
			);
		}
	}
}

// region Business Logic

let generateRandomData = function () {
	for (let [sourceKey, value] of Object.entries(data)) {
		for (let type of Object.keys(value)) {
			let newData = null;

			if (type === "ddStream") {
				if (sourceKey === "random-numbers") {
					newData = {
						name: data[sourceKey]?.ddStream?.length + 1,
						a: Math.random() * 100,
						b: Math.random() * 100,
						c: Math.random() * 100,
					};
				} else if (sourceKey === "random-letters") {
					newData = {
						name: data[sourceKey]?.ddStream?.length + 1,
						letter: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
							Math.floor(Math.random() * 26)
						),
					};
				}
				data[sourceKey]?.ddStream?.push(newData);
				let batch = { ddStream: [newData] };

				broadcastUpdates(sourceKey, batch, ["ddStream"]);
			} else if (type === "ddStatus") {
				let currentStatus = data[sourceKey]?.ddStatus;
				if (!currentStatus) continue;

				newData = {};
				for (let statusKey of Object.keys(currentStatus)) {
					data[sourceKey].ddStatus[statusKey] = Math.random()
						.toString(36)
						.substring(2);
				}

				broadcastUpdates(sourceKey, data[sourceKey]);
			} else {
				continue;
			}
		}
	}
};

let interval_slow = setInterval(generateRandomData, 2000);
console.log(`Started generating random data using ${interval_slow}`);
