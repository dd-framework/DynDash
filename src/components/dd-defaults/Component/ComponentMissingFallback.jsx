const ComponentMissingFallback = ({ componentName, renderType }) => {
	// region Icon

	// HEROICONS question-mark-circle
	let missingIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className="size-6"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
			/>
		</svg>
	);

	// region Rendering Functions

	// Rendering Function that will be used to creatae a Placeholder for the dd-Component, should a full render be impossible or unnecessary
	let renderPlaceholder = (additionalClasses, message, optionalBody) => {
		let isPreview = renderType === "preview";

		message = isPreview ? null : message;

		let className = `${additionalClasses} select-none text-white rounded-lg text-sm border border-gray-600 flex flex-col items-center justify-center text-center space-x-2 space-y-4 w-full h-full`;

		return (
			<>
				<div className={className}>
					<div className="flex items-center justify-center text-center space-x-2">
						{missingIcon}
						{message && <span>{message}</span>}
					</div>

					{!isPreview && optionalBody}
				</div>
			</>
		);
	};

	// region Rendering Logic
	// MODIFY-NONE

	// If the dd-Component is rendered in a preview view, display a simplified version of it without an additional message
	if (renderType === "preview") {
		return renderPlaceholder("bg-red-500/30 backdrop-blur-md", null);
	}

	// Otherwise, try rendering the whole thing along its settings pane
	try {
		return renderPlaceholder(
			"bg-red-500/30 backdrop-blur-md",
			`The Component "${componentName}" could not be found and may need to be imported.`
		);
	} catch (e) {
		// In case there are any errors, render the error placeholder of the dd-Component
		return renderPlaceholder(
			"bg-red-500/30 backdrop-blur-md",
			`An error occured while trying to generate a placeholder for the missing Component "${componentName}": ${e.message}`
		);
	}
};

export default ComponentMissingFallback;
