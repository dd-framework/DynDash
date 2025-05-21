/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx,json}",
		"./component_compiler/**/*.{js,jsx,ts,tsx,json}",
	],
	safelist: [
		"text-red-500",
		"text-yellow-500",
		"text-green-500",
		"text-white-500",
		"cursor-cell",
		"cursor-grab",
		"cursor-green-glow",
		"cursor-purple-blob",
	],
	theme: {
		extend: {
			animation: {
				shake: "shake 0.25s ease-in-out",
				wiggle: "wiggle 0.5s ease-in-out infinite",
				wigglesmall: "wigglesmall 0.75s ease-in-out infinite",
				"border-cycle": "border-cycle 2s ease-in-out infinite",
				"purple-cycle": "purple-bg-cycle 2s ease-in-out infinite",
			},
			keyframes: {
				shake: {
					"0%": { transform: "translateX(0)" },
					"25%": { transform: "translateX(-4px)" },
					"50%": { transform: "translateX(4px)" },
					"75%": { transform: "translateX(-4px)" },
					"100%": { transform: "translateX(0)" },
				},
				wiggle: {
					"0%, 100%": { transform: "rotate(-1deg)" },
					"50%": { transform: "rotate(1deg)" },
				},
				wigglesmall: {
					"0%, 100%": { transform: "rotate(-0.5deg)" },
					"50%": { transform: "rotate(0.5deg)" },
				},
				"border-cycle": {
					"0%, 100%": {
						"border-right-color": "#941ef8",
						"border-bottom-color": "#941ef8",
					},
					"50%": {
						"border-right-color": "#553472",
						"border-bottom-color": "#553472",
					},
				},
				"purple-bg-cycle": {
					"0%, 100%": { "background-color": "#941ef8" },
					"50%": { "background-color": "#553472" },
				},
			},
			backgroundImage: {
				blobs_01: "url('/public/backgrounds/blob-scene-haikei.svg')",
			},
		},
	},
	plugins: [],
};
