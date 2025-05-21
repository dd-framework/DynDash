document.addEventListener("DOMContentLoaded", () => {
	const dropArea = document.getElementById("drop-area");
	const fileInput = document.getElementById("file-input");

	dropArea.addEventListener("click", () => fileInput.click());

	dropArea.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropArea.classList.add("active");
	});

	dropArea.addEventListener("dragleave", () => {
		dropArea.classList.remove("active");
	});

	dropArea.addEventListener("drop", (e) => {
		e.preventDefault();
		dropArea.classList.remove("active");

		const file = e.dataTransfer.files[0];
		if (file && file.name.endsWith(".jsx")) {
			uploadFile(file);
		} else {
			alert("Please upload a valid .jsx file.");
		}
	});

	fileInput.addEventListener("change", () => {
		const file = fileInput.files[0];
		if (file) {
			uploadFile(file);
		}
	});

	function uploadFile(file) {
		const reader = new FileReader();
		reader.readAsText(file); // Read the file as text
		reader.onload = () => {
			const fileContent = reader.result;

			fetch("/compile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filename: file.name,
					content: fileContent,
				}),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.error) {
						alert("Compilation failed: " + data.details);
					} else {
						const compiledCode =
							data[file.name.replace(".jsx", "")];
						const blob = new Blob([compiledCode], {
							type: "text/javascript",
						});
						const a = document.createElement("a");
						a.href = URL.createObjectURL(blob);
						a.download = file.name.replace(".jsx", ".js");
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
					}
				})
				.catch((err) => alert("Error uploading file: " + err.message));
		};
		reader.onerror = () => alert("Error reading file");
	}
});
