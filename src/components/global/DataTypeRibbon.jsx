import React from "react";
import useModalStore from "../../stores/useModalStore";
import useTypeStore from "../../stores/useTypeStore";
import DataTypeIcon from "./DataTypeIcon";

const DataTypeRibbon = ({ dataTypes, additionalClasses, keyContext }) => {
	// region Store Logic

	const getDataTypeObject = useTypeStore((state) => state.getDataTypeObject);

	const customConfirm = useModalStore((state) => state.customConfirm);

	// region Rendering

	return (
		<div
			className={`${additionalClasses} w-fit h-fit space-x-1 flex flex-row justify-end items-center`}
		>
			{dataTypes?.length > 0 &&
				dataTypes.map((entry, index) => {
					// Check whether or not a nested structure is present
					let isSubArray = Array.isArray(entry);

					if (isSubArray) {
						let newKeyContext = `${keyContext}-Nested-${index}`;

						return (
							<DataTypeRibbon
								key={newKeyContext}
								dataTypes={entry}
								additionalClasses={
									"bg-gray-600 rounded-full p-1"
								}
								keyContext={newKeyContext}
							/>
						);
					}

					let dataType =
						typeof entry === "string" || entry instanceof String
							? entry
							: "unknown";

					let hasStar = dataType.indexOf("*") !== -1;
					dataType = dataType.replaceAll("*", "");
					let dataTypeObject = getDataTypeObject(dataType);

					return (
						<DataTypeIcon
							key={`${dataType}-${keyContext}-${index}`}
							hasStar={hasStar}
							dataTypeObject={dataTypeObject}
							clickFunction={async (e) => {
								e.stopPropagation();
								await customConfirm(
									<span className="flex flex-row space-x-2 items-center">
										<p>{`Data Type: `}</p>
										<span className="bg-gray-600 px-2 rounded-lg flex flex-row space-x-2 items-center">
											<DataTypeIcon
												dataTypeObject={dataTypeObject}
											/>
											<p>
												{`${dataType}`}
												{hasStar ? "*" : ""}
											</p>
										</span>
										{hasStar && (
											<span className="text-xs text-gray-400">
												{`*(see Component)`}
											</span>
										)}
									</span>,
									dataTypeObject.explanation
								);
							}}
						/>
					);
				})}
		</div>
	);
};

export default DataTypeRibbon;
