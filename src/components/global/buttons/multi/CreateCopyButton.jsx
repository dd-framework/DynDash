import CreateButton from "../CreateButton";
import CopyButton from "../CopyButton";

const CreateCopyButton = ({ providerName, folderName, fileName }) => {
	return fileName ? (
		<CopyButton
			providerName={providerName}
			folderName={folderName}
			fileName={fileName}
		/>
	) : (
		<CreateButton />
	);
};

export default CreateCopyButton;
