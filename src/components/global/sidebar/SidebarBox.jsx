const SidebarBox = ({ title, onClick, content, sorting }) => {
	return (
		<>
			<div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg p-4 mb-4 shadow-xl">
				<span className="flex justify-between">
					<h3
						className={`font-semibold text-lg text-white ${
							onClick ? "cursor-pointer hover:underline" : ""
						}`}
					>
						<span onClick={onClick}>{title}</span>
					</h3>
					{sorting}
				</span>
				{content}
			</div>
		</>
	);
};

export default SidebarBox;
