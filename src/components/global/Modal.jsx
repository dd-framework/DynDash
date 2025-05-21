import React, { useEffect } from "react";
import useModalStore from "../../stores/useModalStore";
import useConfigStore from "../../stores/useConfigStore";
import useToggleOnKeyPress from "../../hooks/useToggleOnKeyPress";
import ToolTip from "./ToolTip";

const Modal = () => {
	let keyboardShortcutCancel = useConfigStore(
		(state) => state?.dd_config?.dd_frontend?.keyboardShortcuts?.cancelModal
	) || ["esc"];
	let keyboardShortcutConfirm = useConfigStore(
		(state) =>
			state?.dd_config?.dd_frontend?.keyboardShortcuts?.confirmModal
	) || ["⌘", "↵"];

	// region Modal Store Logic

	const modal = useModalStore((state) => state.modal);
	const closeModal = useModalStore((state) => state.closeModal);
	const shake = useModalStore((state) => state.shake);
	const setShake = useModalStore((state) => state.setShake);

	const {
		title,
		message,
		onConfirm,
		onCancel,
		input,
		inputValue,
		setInputValue,
		options,
		renderOptions,
		confirmText,
		cancelText,
		widthSettings,
	} = modal || {};

	useEffect(() => {
		if (shake) {
			const timer = setTimeout(() => {
				setShake(false);
			}, 250); // Match the shake animation duration from tailwind.config.js
			return () => clearTimeout(timer);
		}
	}, [shake, setShake]);

	let cancelOnClick = (e) => {
		if (onCancel) onCancel();
		if (closeModal) closeModal();
	};

	let confirmOnClick = (e) => {
		onConfirm(inputValue);
		closeModal();
	};

	useToggleOnKeyPress(keyboardShortcutCancel, cancelOnClick);

	useToggleOnKeyPress(
		keyboardShortcutConfirm,
		confirmOnClick,
		!(onConfirm && !renderOptions)
	);

	if (!modal) return null;

	// region Rendering

	return (
		<div className="fixed select-none inset-0 z-[1012] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
			<div
				className={`relative backdrop-blur-lg bg-gray-700/80 border border-white/20 rounded-lg shadow-lg text-white rounded-lg shadow-lg ${widthSettings} p-8 ${
					shake ? "animate-shake" : ""
				}`}
			>
				{/* Modal Header */}
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">{title}</h2>
				</div>

				{/* Modal Content */}
				<div className="mb-6">
					<div className="text-gray-300 mb-4">{message}</div>
					{input && (
						<input
							type="text"
							className="w-full p-2 border border-gray-600 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring focus:ring-blue-500"
							onChange={(e) => setInputValue(e.target.value)}
							value={inputValue || ""}
						/>
					)}
					{renderOptions && (
						<div className="space-y-2">
							{options.map((option, index) => (
								<button
									key={index}
									className="w-full px-4 py-2 text-left bg-gray-600/70 text-white rounded-md hover:bg-gray-600 transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400"
									onClick={() => {
										onConfirm(option);
										closeModal();
									}}
								>
									{option}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Modal Footer */}
				<div className="flex justify-end space-x-2">
					{onCancel && (
						<button
							className="relative bg-gray-600/70 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-gray-400"
							onClick={cancelOnClick}
						>
							{cancelText || "Cancel"}
							<ToolTip keys={keyboardShortcutCancel} />
						</button>
					)}
					{onConfirm && !renderOptions && (
						<button
							className="relative bg-blue-600/70 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 shadow-md hover:shadow-gray-500/50 hover:ring-2 hover:ring-blue-400"
							onClick={confirmOnClick}
						>
							{confirmText || "Confirm"}
							<ToolTip keys={keyboardShortcutConfirm} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Modal;
