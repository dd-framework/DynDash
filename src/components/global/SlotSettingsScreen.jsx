import CloseButton from "./buttons/CloseButton";

import React, { useCallback } from "react";

const SlotSettingsScreen = ({
	topContent,
	bottomContent,
	closeSettings,
	componentName,
	sources,
}) => {
	// region Highlighting Logic

	let closeSettingsScreen = useCallback(() => {
		closeSettings();
	}, [closeSettings]);

	// region Rendering

	return (
		<div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 backdrop-blur-sm">
			<div className="absolute inset-y-0 left-0 right-80 flex flex-col p-4">
				{/* Close button */}
				<CloseButton
					closeFunction={closeSettingsScreen}
					classNames="absolute z-[1003] top-4 left-4"
				/>

				{/* Top Section */}
				<div
					id="slot-detail"
					className="flex-1 p-10 z-[1001] transition-transform transform overflow-scroll"
				>
					{topContent}
				</div>

				{/* Bottom Section */}
				<div className="flex-1 p-10 z-[1001] transition-transform transform overflow-scroll">
					{bottomContent}
				</div>
			</div>
		</div>
	);
};

export default SlotSettingsScreen;
