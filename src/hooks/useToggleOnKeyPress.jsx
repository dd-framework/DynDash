import { useEffect } from "react";
import isInputInFocus from "../utility/InputInFocusUtility";

const useToggleOnKeyPress = (keys, toggleCallback, shouldSkip = false) => {
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (shouldSkip) return;

			let pressedKey = e.key.toUpperCase();
			if (pressedKey === "ESCAPE") pressedKey = "esc";

			if (isInputInFocus()) {
				if (pressedKey === "esc") {
					const activeElement = document.activeElement;
					setTimeout(() => {
						activeElement?.blur();
					}, 0);
				}

				return;
			}

			if (pressedKey === "ARROWLEFT") pressedKey = "←";
			if (pressedKey === "ARROWRIGHT") pressedKey = "→";
			if (pressedKey === "ARROWUP") pressedKey = "↑";
			if (pressedKey === "ARROWDOWN") pressedKey = "↓";
			if (pressedKey === "BACKSPACE") pressedKey = "⌫";
			if (pressedKey === "ENTER") pressedKey = "↵";

			let xand = (a, b) => {
				return (a && b) || (!a && !b);
			};

			let macOSClient = navigator.userAgent.indexOf("Mac OS X") !== -1;

			let altPasses = xand(e.altKey, keys.includes("⌥"));
			let shiftPasses = xand(e.shiftKey, keys.includes("⇧"));
			let metaPassesMac = xand(e.metaKey, keys.includes("⌘"));
			let metaPassesOther = xand(e.ctrlKey, keys.includes("⌘"));

			let metaPasses =
				(macOSClient && metaPassesMac) ||
				(!macOSClient && metaPassesOther);

			let keyPasses = keys.includes(pressedKey);

			if (keyPasses && altPasses && shiftPasses && metaPasses) {
				e.preventDefault();
				toggleCallback();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [keys, toggleCallback, shouldSkip]);
};

export default useToggleOnKeyPress;
