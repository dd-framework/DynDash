import { useRef, useCallback } from "react";

// Made in order to optimize event listeners

const useThrottle = (func, delay) => {
	const lastCall = useRef(0);

	return useCallback(
		(...args) => {
			const now = Date.now();
			if (now - lastCall.current > delay) {
				lastCall.current = now;
				func(...args);
			}
		},
		[func, delay]
	);
};

export default useThrottle;
