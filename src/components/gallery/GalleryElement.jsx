import BoardView from "../global/BoardView";
import FileName from "../global/FileName";

const GalleryElement = ({ providerName, folderName, fileName, onClick }) => {
	return (
		<div
			onClick={onClick}
			className="bg-gray-800/50 backdrop-blur-md border border-white/20 rounded-lg shadow-md group hover:shadow-[0_10px_30px_5px_rgba(38,38,38,0.8)] hover:shadow-blue-500/50 hover:ring-4 hover:ring-blue-500 hover:ring-purple-500 hover:ring-opacity-40 transition-all ease-in-out duration-300 select-none p-4 w-full cursor-pointer"
		>
			<h3>
				<FileName
					providerName={providerName}
					folderName={folderName}
					fileName={fileName}
					renderType="preview"
				/>
			</h3>
			<div className="flex justify-center">
				<BoardView
					providerName={providerName}
					folderName={folderName}
					fileName={fileName}
					renderType={"preview"}
				/>
			</div>
		</div>
	);
};

export default GalleryElement;
