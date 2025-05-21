// The output code from ESBuild will include various different references to React and maybe even react-dom.
// However, an application can only use one instance of React without major issues.
// This is why we need to replace these "attempted imports" with references to the React and ReactDOM that are inserted globally in the window.

// Obviously, this is pretty hacky, but it's the current working solution that will be improved later on.

module.exports = function transformCode(code) {
	let replacers = [
		{
			regex: /import\s+React\s+from\s+["']react["'];?/g, // Replace "import React from 'react';" (React default import)
			replacement: "React",
		},
		{
			regex: /__require\s*\(\s*['"]react['"]\s*\)\s*;?/g, // Replaces require() calls for 'react'
			replacement: "React",
		},
		{
			regex: /__require\s*\(\s*['"]react-dom['"]\s*\)\s*;?/g, // Replaces require() calls for 'react-dom'
			replacement: "ReactDOM",
		},
		{
			regex: /import\s+([a-zA-Z0-9_$]+)\s*,\s*{\s*([^}]+)\s*}\s*from\s*["']react["'];?/g, // Handle imports with both default & named imports
			replacement: (match, defaultImport, namedImports) => {
				// Convert named imports with "as" (e.g., PureComponent as PureComponent2 → PureComponent: PureComponent2)
				const transformedNamedImports = namedImports
					.split(",")
					.map((imp) => imp.trim().replace(/\s+as\s+/g, ": "))
					.join(", ");

				return `const ${defaultImport} = React; const { ${transformedNamedImports} } = React;`;
			},
		},
		{
			regex: /import\s*{\s*([^}]+)\s*}\s*from\s*["']react["'];?/g, // Handle named imports only: import { something as alias } from "react";
			replacement: (match, namedImports) => {
				const transformedNamedImports = namedImports
					.split(",")
					.map((imp) => imp.trim().replace(/\s+as\s+/g, ": "))
					.join(", ");
				return `const { ${transformedNamedImports} } = React;`;
			},
		},
		{
			regex: /import\s+([a-zA-Z0-9_$]+)\s+from\s+["']react["'];?/g, // Handle default imports only: import React6 from "react";
			replacement: (match, defaultImport) => {
				return `const ${defaultImport} = React;`;
			},
		},
		{
			regex: /import\s+\*\s+as\s+([a-zA-Z0-9_$]+)\s+from\s+["']react["'];?/g, // Handle astersik imports only: import * as React6 from "react"
			replacement: (match, namespaceImport) => {
				return `const ${namespaceImport} = React;`;
			},
		},
		{
			regex: /import\s+([a-zA-Z0-9_$]+)\s*,\s*{\s*([^}]+)\s*}\s*from\s*["']react-dom["'];?/g, // Handle default + named imports for react-dom
			replacement: (match, defaultImport, namedImports) => {
				const transformedNamedImports = namedImports
					.split(",")
					.map((imp) => imp.trim().replace(/\s+as\s+/g, ": "))
					.join(", ");
				return `const ${defaultImport} = ReactDOM; const { ${transformedNamedImports} } = ReactDOM;`;
			},
		},
		{
			regex: /import\s*{\s*([^}]+)\s*}\s*from\s*["']react-dom["'];?/g, // Handle named imports only for react-dom
			replacement: (match, namedImports) => {
				const transformedNamedImports = namedImports
					.split(",")
					.map((imp) => imp.trim().replace(/\s+as\s+/g, ": "))
					.join(", ");
				return `const { ${transformedNamedImports} } = ReactDOM;`;
			},
		},
		{
			regex: /import\s+([a-zA-Z0-9_$]+)\s+from\s+["']react-dom["'];?/g, // Handle default imports only for react-dom
			replacement: (match, defaultImport) => {
				return `const ${defaultImport} = ReactDOM;`;
			},
		},
	];

	let transformedCode = code;

	for (let replacer of replacers) {
		transformedCode = transformedCode.replace(
			replacer.regex,
			replacer.replacement
		);
	}

	return transformedCode;
};
