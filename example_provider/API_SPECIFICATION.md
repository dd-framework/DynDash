FORMAT: 1A

# Provider API

This Provider API provides basic REST endpoints to retrieve Provider information, Source details, and Data. It also supports a WebSocket connection for real-time updates of said Source Data.

# Group REST Endpoints

---
---
---

## Icon Resource [/icon]
The icon endpoint serves a static SVG image that will be used by the DynDash to represent this Provider API.

### Retrieve Icon [GET]
+ Response 200 (image/svg+xml)
	+ Headers

			Content-Type: image/svg+xml

	+ Body

			<!-- The contents of icon.svg -->

---
---
---

## Provider Info [/info]
This endpoint returns basic Provider information. DynDash applications will use this information to represent the Provider in the interface, and use it internally for fetching and connectivity purposes. No two Provider APIs can share the same name, as the DynDash application would only respect one of them at a time.

### Retrieve Information [GET]
+ Response 200 (application/json)
	+ Attributes (object)
		+ name: `<provider name>` (string) - The value represents the provider's name.
		+ info: `<short text>` (string) - The value represents a short overview of the provider's purpose.
		+ provides (object):
			+ dashboards: `<declares whether or not the provider serves this>` (boolean)
			+ components: `<declares whether or not the provider serves this>` (boolean)
			+ sources: `<declares whether or not the provider serves this>` (boolean)
			+ types: `<declares whether or not the provider serves this>` (boolean)

	+ Example Response

	```json
	{
	  "name": "ExampleProvider",
	  "info": "This is simply an example Provider that is used to showcase how to set these up",
	  "provides": {
		"dashboards": false,
		"components": false,
		"sources": true,
		"types": true
	  },
	}
	```

---
---
---

## Components [/components]
This endpoint is reserved for Components.

### Retrieve Components [GET]
+ Response 200 (application/json)
	+ Attributes (object)
		+ (optional) key-value pairs:
			+ (string) - The key represents a filename (with any file extensions trimmed off).
			+ (string) - The value is the string content of the file.

	+ Example Response

	```json
	{
	  "ComponentA": "<file content of ComponentA>",
	  "ComponentB": "<file content of ComponentB>"
	  // additional Components
	}
	```

---
---
---

## Dashboards [/dashboards]

An endpoint used to get the names of all folders that can be fetched

### List Dashboard Folders [GET]

+ Response 200 (application/json)
    + Attributes (array[string])
        + Example Response

            ```json
            [
                "folder1/path",
                "folder2/path",
                "folder3/path"
            ]
            ```

+ Response 400 (application/json)
    + Attributes
        + message: Folders could not be listed. (string)
    + Example Response

        ```json
        {
            "message": "Folders could not be listed."
        }
        ```

---

## Reveal Dashboards [/dashboards/reveal]

An endpoint that can be used to prompt the provider to reveal a certain folder in the file system explorer. This endpoint is useful when the provider and the DynDash application are both accessible to the user.

### Reveal Dashboard Folders [POST]

+ Request (application/json)
    + Attributes
        + folders: (array[string], required) - Array of folder paths to reveal.
    + Example Request

        ```json
        {
            "folders": [
                "folder1/path",
                "folder2/path"
            ]
        }
        ```

+ Response 200 (application/json)
    + Attributes
        + message: Folders revealed successfully. (string)
    + Example Response

        ```json
        {
            "message": "Folders revealed successfully."
        }
        ```

+ Response 200 (application/json)
    + Attributes
        + message: Could not reveal any folders. (string)
    + Example Response

        ```json
        {
            "message": "Could not reveal any folders"
        }
        ```

---

## Fetch Dashboards [/dashboards/fetch]

An endpoint used to fetch the contents of dashboards from a list of folders.

### Fetch Dashboard Data [POST]

+ Request (application/json)
    + Attributes
        + folders: (array[string], required) - Array of folder paths to fetch.
    + Example Request

        ```json
        {
            "folders": [
                "folder1/path",
                "folder2/path"
            ]
        }
        ```

+ Response 200 (application/json)
    + Example Response

        ```json
        {
            "folder1/path": {
                "dashboardA": {
                    "folder": "folder1/path",
                    "status": "disk",
                    "timestamp": 1714060800,
                    "data": {...}
                }
            },
            "folder2/path": {
                "dashboardB": {
                    "folder": "folder2/path",
                    "status": "deleted",
                    "timestamp": 1714060800,
                    "data": {...}
                }
            }
        }
        ```

+ Response 500 (application/json)
    + Attributes
        + message: Failed to fetch dashboard data. (string)
    + Example Response

        ```json
        {
            "message": "Failed to fetch dashboard data."
        }
        ```

---

## Persist Dashboard [/dashboards/persist]

An endpoint used to persist a singular dashboard to the provider's storage.

### Persist Dashboard Data [POST]

+ Request (application/json)
    + Attributes
        + fileName: (string, required) - Name of the file to persist.
        + folder: (string, required) - Folder path where the file will be saved.
        + data: (object, required) - Arbitrary JSON object to persist.
    + Example Request

        ```json
        {
            "fileName": "dashboardZ",
            "folder": "folder1/path",
            "data": {...}
        }
        ```

+ Response 200 (application/json)
	+ Attributes
        + folder: (string, required) - Folder path where the file will be saved.
        + status: (string, fixed) - Current status of the file (always `disk` after saving)
		+ timestamp: (number, required) - Timestamp of the saving
        + data: (object, required) - Usually the JSON content of the file after saving
    + Example Response

        ```json
        {
            "folder": "folder1/path",
            "status": "disk",
            "timestamp": 1714060800,
            "data": {...}
        }
        ```

+ Response 400 (application/json)
    + Attributes
        + message: Invalid file data provided in request. (string)
    + Example Response

        ```json
        {
            "message": "Invalid file data provided in request."
        }
        ```

+ Response 404 (application/json)
    + Attributes
        + message: Dashboard file not found. (string)
    + Example Response

        ```json
        {
            "message": "Dashboard file not found."
        }
        ```

+ Response 500 (application/json)
    + Attributes
        + message: Failed to persist dashboard data. (string)
    + Example Response

        ```json
        {
            "message": "Failed to persist dashboard data."
        }
        ```

---

## Delete Dashboard [/dashboards/delete]

An endpoint used to delete a singular dashboard from the provider's storage. Often times it is practical to simply move the file to a `.trash` subdirectory and serve it as usual upon `"fetch"`, with the exception of the status being `"deleted"`.

### Delete Dashboard File [POST]

+ Request (application/json)
    + Attributes
        + fileName: (string, required) - Name of the file to delete.
        + folder: (string, required) - Folder path containing the file.
    + Example Request

        ```json
        {
            "fileName": "dashboardW",
            "folder": "folder1/path"
        }
        ```

+ Response 200 (application/json)
    + Attributes
        + message: Dashboard file deleted successfully. (string)
    + Example Response

        ```json
        {
            "message": "Dashboard file deleted successfully."
        }
        ```

+ Response 400 (application/json)
    + Attributes
        + message: Invalid file data provided in request. (string)
    + Example Response

        ```json
        {
            "message": "Invalid file data provided in request."
        }
        ```

+ Response 404 (application/json)
    + Attributes
        + message: Dashboard file not found. (string)
    + Example Response

        ```json
        {
            "message": "Dashboard file not found."
        }
        ```

+ Response 500 (application/json)
    + Attributes
        + message: Failed to delete dashboard file. (string)
    + Example Response

        ```json
        {
            "message": "Failed to delete dashboard file."
        }
        ```

---

## Recover Dashboard [/dashboards/recover]

An endpoint used to recover a singular deleted dashboard from the provider's way of marking a file as deleted.

### Recover Dashboard File [POST]

+ Request (application/json)
    + Attributes
        + fileName: (string, required) - Name of the file to recover.
        + folder: (string, required) - Folder path containing the file.
    + Example Request

        ```json
        {
            "fileName": "dashboardG",
            "folder": "folder1/path"
        }
        ```

+ Response 200 (application/json)
    + Attributes
        + message: Dashboard file recovered successfully. (string)
    + Example Response

        ```json
        {
            "message": "Dashboard file recovered successfully."
        }
        ```

+ Response 400 (application/json)
    + Attributes
        + message: Invalid file data provided in request. (string)
    + Example Response

        ```json
        {
            "message": "Invalid file data provided in request."
        }
        ```

+ Response 404 (application/json)
    + Attributes
        + message: Dashboard file not found. (string)
    + Example Response

        ```json
        {
            "message": "Dashboard file not found."
        }
        ```

+ Response 500 (application/json)
    + Attributes
        + message: Failed to recover dashboard file. (string)
    + Example Response

        ```json
        {
            "message": "Failed to recover dashboard file."
        }
        ```

---

## Rename Dashboard [/dashboards/rename]

An endpoint used to rename a singular dashboard.

### Rename Dashboard File [POST]

+ Request (application/json)
    + Attributes
        + fileName: (string, required) - Current name of the file.
        + newFileName: (string, required) - New name for the file.
        + folder: (string, required) - Folder path containing the file.
    + Example Request

        ```json
        {
            "fileName": "dashboard.json",
            "newFileName": "dashboard-renamed.json",
            "folder": "folder1/path"
        }
        ```

+ Response 200 (application/json)
    + Attributes
        + message: Dashboard file renamed successfully. (string)
    + Example Response

        ```json
        {
            "message": "Dashboard file renamed successfully."
        }
        ```

+ Response 400 (application/json)
    + Attributes
        + message: Invalid file data provided in request. (string)
    + Example Response

        ```json
        {
            "message": "Invalid file data provided in request."
        }
        ```

+ Response 404 (application/json)
    + Attributes
        + message: Dashboard file not found. (string)
    + Example Response

        ```json
        {
            "message": "Dashboard file not found."
        }
        ```

+ Response 500 (application/json)
    + Attributes
        + message: Failed to rename dashboard file. (string)
    + Example Response

        ```json
        {
            "message": "Failed to rename dashboard file."
        }
        ```


---
---
---

## Data Types [/types]
Provides available source types.

### Retrieve Data Types [GET]
Each key of the object represents a Data Type that has to be unique (the DynDash will not store duplicate keys).

+ Response 200 (application/json)
	+ Attributes: (object)
		+ (optional) key-value pairs:
			+ (string) - The key represents a Data Type
			+ (object) - The value represents an object describing the Data Type
	+ Example Response

	```json
	{
	  "customDT": {
		"icon": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5906 5906' stroke-width='1.5' stroke='currentColor' fill='#ffffff' class='w-5 h-5 mr-0 inline align-middle'><path stroke='none' fill-rule='evenodd' d='M 905 2953.5 L 2952.5 5001 L 5000 2953.5 L 2952.5 906 Z'/></svg>",
		"color": "rgb(159, 130, 255)",
		"explanation": "A custom Data Type that is simply used for demonstrating how to set these up. Sources with this type include the data key 'customDT', which usually stores something really weird for demonstration purposes."
	  }
	},
	// additional Data Types
	```

---
---
---

## Sources Collection [/sources]
Provides details about available sources.

### Retrieve Sources [GET]
Each key of the object represents a Source key that has to be unique (the DynDash will not store duplicate keys).

> The "connection" object supports both Sources that are connected via WebSocket, as well as Sources whose data is supposed to be retreived via HTTP polling. The latter object can also take values for the keys "method" and "interval". If no interval is given, the DynDash fetches only once.

+ Response 200 (application/json)
	+ Attributes: (object)
		+ (optional) key-value pairs:
			+ (string) - The key represents a Source key
			+ (object) - The value represents an object describing the Source
	+ Example Response

	```json
	{
	  "random-numbers": {
		"name": "Random Numbers",
		"information": "stream with 3 randomized values",
		"explanation": "This Source holds a ddStream array. Each entry is an object with keys such as 'name' and randomized values.",
		"dataTypes": ["ddStream"],
		"connection": {
		  "protocol": "WS",
		  "address": "ws://localhost:4451/sources/data",
		  "endpoint": "random-numbers"
		}
	  },
	  // additional Sources
	}
	```

---

## Sources Data [/sources/data]
Used to access the data of sources.

### Retrieve All Sources Data [GET]
Provides a collection of all source data bundled into an object with the key-value pairs being source-key + source-data.
+ Response 200 (application/json)
	+ Attributes: (object)
		+ (optional) key-value pairs:
			+ (string) - The key represents a Source key
			+ (object) - The value represents the data of the Source
	+ Example Response

	```json
	{
	  "sourceKey": {
		"ddStatus": {...}
	  },
	  // additional Source Key + Source Data mappings
	}
	```

---

## Specific Source Data [/sources/data/{key}]
Provides data for a specific source.

+ Parameters
	+ key: `someKey` (string, required) - Unique identifier for the source.

### Retrieve Specific Source Data [GET]
+ Response 200 (application/json)
	+ Attributes: (object)
		+ (optional) key-value pairs:
			+ (string) - The key represents a Data Type
			+ (object) - The value represents the data of said Data Type in the Data of the Source
	+ Example Response

	```json
	{ 
	  "ddStream": [{...}, {...}, ...]
	  // additional Data Types included in the Data
	}
	```
+ Response 404
	+ Description: Source or data for the specified key was not found.

---
---
---

# Provider WebSocket API

The API supports real-time communication via WebSocket connections on the same host/port.

## WebSocket Connection

Clients establish a WebSocket connection to the API server and send a JSON message to subscribe to a particular source.

### Client Request
The client should send a JSON payload in the following format:

```json
{
  "source": "source_identifier"
}
```

### Server Responses

+ **Successful Connection**  
  If the specified source exists and data is available, the server responds with:

  ```json
  {
	"status": "connected",
	"source": "source_identifier",
	"data": {...}	// source data object, like the example response from /sources/data/{key}
  }
  ```

+ **Error Cases**  
  - **Source Not Found**  
	If the requested source is not defined:

	```json
	{
	  "error": "Source \"source_identifier\" not found."
	}
	```

  - **Data Not Available**  
	If the source exists but no data is available:

	```json
	{
	  "error": "No data available for source \"source_identifier\"."
	}
	```

  - **Invalid Message Format**  
	If the client sends a malformed JSON or missing required fields:

	```json
	{
	  "error": "Invalid message format."
	}
	```

### Update Notifications

When data is updated for a subscribed source, the server should broadcast an update message to connected clients. The update message has the following format.

```json
{
  "status": "updated",
  "source": "source_identifier",
  "data": {...},	// source data object, like the example response from /sources/data/{key}
  "append": [],		// optional key that holds Data Type names for Data Types in "data" that are supposed to be appended to the data currently in DynDash, instead of replacing it.
}
```

With WebSocket connections, it is possible to send batched updates for array-based Data Types such as `ddStream`. To do so, the "append" key needs to be an array that includes the Data Types from the "data" object whose Data should be appended to the Data currently present in the DynDash, instead of replacing it.