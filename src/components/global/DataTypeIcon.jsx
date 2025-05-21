import React from "react";

const DataTypeIcon = ({ dataTypeObject, hasStar, clickFunction }) => {
	let iconString = dataTypeObject.icon;
	let backgroundColor = dataTypeObject.color;

	return (
		<>
			<span
				className={`rounded-full m-0 w-5 h-5 flex items-center justify-center cursor-default shadow-md shadow-gray-900/50`}
				style={{ backgroundColor: backgroundColor }}
				dangerouslySetInnerHTML={{
					__html: iconString,
				}}
				onClick={clickFunction}
			></span>
			{hasStar && <span className="!ml-0">*</span>}
		</>
	);
};

export default DataTypeIcon;
