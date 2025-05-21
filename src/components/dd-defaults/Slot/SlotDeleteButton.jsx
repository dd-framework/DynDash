const SlotDeleteButton = ({ onClick }) => {
	return (
		<button
			className="absolute top-0 left-0 opacity-0 select-none group-hover:opacity-100 hover:text-red-500 text-white/50 text-4xl font-black w-8 h-8 flex items-center justify-center transition duration-300 z-[1004]"
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
		>
			<p>&times;</p>
		</button>
	);
};

export default SlotDeleteButton;
