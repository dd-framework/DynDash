// region Config

const transformCode = require("./string_replacer");
const esbuild = require("esbuild");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 4433;

// region Setup

app.use(express.json());
app.use(cors());

let components = {};

const tempDir = path.join(__dirname, "temp");
const distDir = path.join(__dirname, "dist");

// Ensure the "temp" and "dist" directories exists
for (let dir of [tempDir, distDir]) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

// region REST Routes

app.use("/icon", express.static(path.join(__dirname, "icon.svg")));

app.use("/info", (req, res) => {
	res.json({
		name: "ComponentCompiler",
		info: "This Provider is a Component Compiler helper application that can be used to compile and bundle .jsx Components to DynDash-imporable .js files. It does so with any .jsx files listed in its /src/ directory, which are then served as Components. The Component whose Provider Info you just clicked on is likely one of them. This Provider also hosts a web-interface at http://localhost:4433, where you can go to drag-and-drop / upload your Components, which will then be compiled and spat back at you, ready to be used in your own custom Providers.",
		provides: {
			dashboards: false,
			components: true,
			sources: false,
			types: false,
		},
	});
});

app.get("/components", async (req, res) => {
	res.json(components);
});

// region Business Logic - Compilation

const externalReactPlugin = {
	name: "external-react-handler",
	setup(build) {
		// Handle all variations of React imports
		build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => {
			return {
				path: args.path,
				external: true,
			};
		});
	},
};

let compileComponent = async (filePath) => {
	try {
		let builtJSX = await esbuild.build({
			entryPoints: [filePath],
			bundle: true,
			write: false,
			target: "esnext",
			format: "esm",
			platform: "browser",
			loader: { ".js": "jsx" },
			plugins: [externalReactPlugin],
			logLevel: "silent",
			logOverride: {
				"direct-eval": "silent",
			},
		});

		let filename = path.basename(filePath);
		let componentName = filename.replace(".jsx", "");
		let code = builtJSX.outputFiles[0].text;
		let transformedCode = transformCode(code);

		let returnObject = {};
		returnObject[componentName] = transformedCode;
		return returnObject;
	} catch (err) {
		console.error(`Error transforming file ${filePath}:`, err);
	}
};

let runDiskCompilation = async () => {
	let src = path.join(__dirname, "src");
	let dist = path.join(__dirname, "dist");
	let files = [];

	try {
		files = fs.readdirSync(src);
	} catch {
		console.log("An error occurred while trying to find directory.");
		return;
	}

	for (let file of files) {
		let filePath = path.join(src, file);
		let stat = fs.statSync(filePath);

		if (stat.isFile() && path.extname(file) === ".jsx") {
			let filePath = path.join(src, file);
			try {
				const componentName = file.replace(".jsx", "");
				const compiledComponent = await compileComponent(filePath);

				// Load it into the "to be served components" object
				components = {
					...components,
					...compiledComponent,
				};

				// Write it to the corresponding dist file (.js)
				const outputFile = path.join(dist, `${componentName}.js`);
				fs.writeFileSync(outputFile, compiledComponent[componentName]);
				console.log(`Compiled ${file} -> ${outputFile}`);
			} catch (err) {
				console.error(`Error transforming file ${file}:`, err);
			}
		}
	}
};

runDiskCompilation();

// region Business Logic - Web Application

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/compile", async (req, res) => {
	try {
		if (!req.body || !req.body.filename || !req.body.content) {
			return res.status(400).json({ error: "No file data provided." });
		}

		const { filename, content } = req.body;
		const filePath = path.join(__dirname, "temp", filename);

		await fs.promises.writeFile(filePath, content, "utf8");
		console.log(`\nTrying to compile ${filePath}`);
		const compiledResult = await compileComponent(filePath);
		await fs.promises.unlink(filePath);

		res.json(compiledResult);
	} catch (err) {
		console.error("Error during compilation:", err);
		res.status(500).json({
			error: "Compilation failed",
			details: err.message,
		});
	}
});

// region Servers and WebSockets

let restServer = app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}`)
);
