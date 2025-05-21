import useBoardStore from "../../stores/useBoardStore";
import GalleryFolder from "./GalleryFolder";

const FileGallery = () => {
	let providers = useBoardStore((state) => state.dashboards);

	// region Rendering

	if (!providers || Object.keys(providers)?.length === 0) {
		return (
			<div className="text-center text-gray-300">No Files found...</div>
		);
	}

	let folderArray = [];

	for (let providerName of Object.keys(providers)) {
		let folderNames = Object.keys(providers[providerName]);

		for (let folderName of folderNames) {
			folderArray.push(
				<GalleryFolder
					key={`GalleryFolder-${providerName}-${folderName}`}
					providerName={providerName}
					folderName={folderName}
				/>
			);
		}
	}

	return (
		<div
			className="relative h-[80vh] overflow-scroll pt-[35px] pb-[20px]"
			style={{
				WebkitMaskImage:
					"linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 30px, rgba(0, 0, 0, 1) calc(100% - 70px), rgba(0, 0, 0, 0) 100%)",
				maskImage:
					"linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 30px, rgba(0, 0, 0, 1) calc(100% - 70px), rgba(0, 0, 0, 0) 100%)",
			}}
		>
			<div className="relative z-0">{folderArray}</div>
		</div>
	);
};

export default FileGallery;
