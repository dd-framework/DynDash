import useBoardStore from "../../../../stores/useBoardStore";
import DeleteButton from "../DeleteButton";
import RecoverButton from "../RecoverButton";

const DeleteRecoverButton = ({ providerName, folderName, fileName }) => {
	const getBoardStatus = useBoardStore((state) => state.getBoardStatus);
	let boardStatus = getBoardStatus(providerName, folderName, fileName);

	let recoverable = boardStatus.includes("deleted");

	return recoverable ? (
		<RecoverButton
			providerName={providerName}
			folderName={folderName}
			fileName={fileName}
		/>
	) : (
		<DeleteButton
			providerName={providerName}
			folderName={folderName}
			fileName={fileName}
		/>
	);
};

export default DeleteRecoverButton;
