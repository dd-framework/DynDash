import RenameButton from "../RenameButton";
import SettingsButton from "../SettingsButton";

const RenameSettingsButton = ({ providerName, folderName, fileName }) => {
	return fileName ? (
		<RenameButton
			providerName={providerName}
			folderName={folderName}
			fileName={fileName}
		/>
	) : (
		<SettingsButton />
	);
};

export default RenameSettingsButton;
