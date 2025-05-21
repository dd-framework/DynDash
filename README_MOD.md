# Modifying the Application

This file serves as a documentation for all of the magic-strings and values found across the application, since that is probably pretty valuable information to have when trying to change the way the application works at a base level. Obviously, it would have been better to not use these concepts at all, so this will be a future point of improvement.

---

## File Status:
| Status           | BE  | BE newest | FE newest | Deleted | FE survives refresh |
| ---------------- | --- | --------- | --------- | ------- | ------------------- |
| `new`            | N   |           | Y         | N       | N                   |
| `unsaved`        | Y   | N         | Y         | N       | N                   |
| `disk`           | Y   | Y         | Y         | N       | Y                   |
| `deleted`        | Y   | Y         | Y         | Y       | Y                   |
| `newdeleted`     | N   |           | Y         | Y       | N                   |
| `unsaveddeleted` | Y   | N         | Y         | Y       | N                   |

---

## `renderType` Property in Component Rendering:

- `sidebar`: Never render content, only represent with icon and name
- `preview`: Preferably never render content, represent with icon
- `detail`: Fully render **Component**, this is for actually viewing it
- `settings`: **Component** is in larger view, but this shouldn't change much from detail

---

## Tool Modes:
- `null`: Viewing and interacting with **Components**
- `move`: Moving **Slots**
- `draw`: Drawing new **Slots**
- `select`: Selection of multiple **Slots**
- `resize`: Resizing, Renaming and Deletion of **Slots**

---

## Grid Modes:
- `null`: Nothing
- `grid`: Showing grid
- `grid-labelled`: Showing grid with names of row and column

---

## Info Modes:
- `null`: Nothing
- `info`: Shows **Providers** and styles sidebar elements when hovering over **Slots**
- `slots`: Same as `info`, but also shows **Slot** contents in a literal view

---

## Tooltip Modes:
- `null`: Nothing
- `keys`: Shows tooltips

---

## `z-index` Layers:
- `3`: Grid cells
- `4`: **Slots**
- `5`: Slot interaction overlay
- `6`: Invisible drawing grid
- `7`: **Slot** manipulation preview elements
- `1000`: **Slot** settings background blur
- `1001`: **Slot** settings topContent
- `1001`: **Slot** settings bottomContent
- `1002`: Alert pane
- `1002`: Sidebar
- `1003`: Sidebar button
- `1003`: Alert button
- `1003`: Selection delete button
- `1003`: ToolMode indicator
- `1003`: **Slot** settings CloseButton
- `1003`: **Slot** settings color picker
- `1004`: **Slot** manipulation controls ("R"-tools)
- `1005`: File upload overlay
- `1010`: FileGallery transparency element
- `1011`: Application settings
- `1012`: System modal

---