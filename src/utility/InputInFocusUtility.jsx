let isInputInFocus = () => {
	const activeElement = document.activeElement;

	let isTypingArea =
		activeElement &&
		(activeElement.tagName === "INPUT" ||
			activeElement.tagName === "TEXTAREA" ||
			activeElement.isContentEditable);

	return isTypingArea;
};

export default isInputInFocus;
