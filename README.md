# DynDash

The application [DynDash](/README.md) (Dynamic Dashboards) aims to provide users the ability to quickly create **Dashboards** that visualize diverse data types.

![DynDash_Example](/media/screenshots/DynDash_Example.png)

It allows users to:
- Create and manage **Dashboards** with multiple **Slots**, which can be rearranged and modified easily
- Populate those **Slots** with **Components**, **Sources**, and **Settings**, creating powerful visualizations
- Manage various **Provider** APIs that can be connected to the [DynDash](/README.md) application, each supplying specialized entities
    > [!info]
	> The API spec for **Providers** is laid out [here](/example_provider/API_SPECIFICATION.md)

---

## Structure

As a brief illustration, the following image shows how the application is structured:

![DynDash_Application_Structure_2b](/media/structures/DynDash_Application_Structure_2b.png)

---

## Installation

This project was built using [Node.js](https://nodejs.org/en) `v23.2.0`. It may be possible to run the App using other versions, but this has not been tested. Multiple installations of [Node.js](https://nodejs.org/en) can be managed easily using the [Node Version Manager](https://github.com/nvm-sh/nvm).

To install all the necessary dependencies before initial boot, run `npm install` in the project's root directory.

> [!info]
> If you want to build the project (typically not recommended, as the application relies on the webpack server's reloading functionality), you may need to use a lower [Node.js](https://nodejs.org/en) version (like `v22.2.0`).

---

## Preparing the Application

### Registering Providers

You will need to register the URLs of any **Providers** you want the application to interface with. Per default, many exemplary **Providers** are already registered. These include:

| Application | Purpose |
|-|-|
| Dashboard Hub | Provides **Dashboards** and allows for simple CRUD functionality |
| Example Provider | Provides some dummy data **Sources** and **Types** for testing purposes |
| Component Compiler | Provides a set of default **Components** and has a [web interface](http://localhost:4433) for manually compiling new ones |


Registering new **Providers** can be done through the application's `/src/dd_config.json` file, or through the interface found [here](http://localhost:3002) while the application is running.

These **Providers** can be used as a basis for creating your own **Provider** application.

> It must be noted that creating a **Dashboard Provider** is probably rarely necessary for many users, as simply modifying the `config.json` of the existing `/dashboard_provider/` is likely enough. Additionally, **Component Providers** are also not something that users might want to develop regularly, due to the complexity compiling building the **Components**.
>
> Creating custom Sources however, is intended to be frequently done, which is why the `/example_provider/` is the shortest and most simplified one of the helper applications.

---

## Running the Application

Run `npm start` in the root of this directory, if you want to launch all of the applications simultaneously.

You can also run applications individually, or in small groups:
- The script `npm run dyndash` will start the application's [frontend](http://localhost:3000) and [config editor](http://localhost:3002).
- The script `npm run providers` will start all of the default **Providers**.

---

## Using the Application

The start page will show all **Dashboard** that have been provided to the application.

![DynDash_Gallery_Clean](/media/screenshots/DynDash_Gallery_Clean.png)

### Managing Dashboards

Clicking on a folder path may reveal said path in the operating system's default file explorer.

Files can be created, imported, reloaded, renamed, modified, duplicated, deleted, and recovered using the buttons found in the header of the application.

![DynDash_Header_Gallery](/media/screenshots/DynDash_Header_Gallery.png)

![DynDash_Header_Detail](/media/screenshots/DynDash_Header_Detail.png)

It is also possible to import files by dragging them into the application. Valid drop targets include:
- folder path on start page (automatically inserts file into folder)
- file preview on start page (asks for replacement strategy)
- **Dashboard** area in detail view (asks for replacement strategy)

![DynDash_Gallery_Upload_File](/media/screenshots/DynDash_Gallery_Upload_File.png)

![DynDash_Gallery_Upload_Folder](/media/screenshots/DynDash_Gallery_Upload_Folder.png)

Clicking on a **Dashboard** will open said **Dashboard** in the application's detail view.

### Detail View:

The detail view will allow you to view and edit your **Dashboard**.

![DynDash_Example](/media/screenshots/DynDash_Example.png)

- This view has a sidebar that can be toggled by pressing `T` (default shortcut)
- The application has four distinct "Tool Modes" that can be toggled through a click or by pressing the associated key
    - `M` (Move) Enables moving the **Slots** by dragging and dropping them
	- `D` (Draw) Enables drawing new **Slots**
	- `R` (Rename, Resize, Remove) Allows for the renaming, resizing, and deletion of **Slots**
	- `S` (Select) Allows to select multiple **Slots** at once

Users can drag and drop **Components** and **Sources** onto these **Slots** while no tool is active (or while the select tool is made, enabling bulk operations).

### Helpful Features:

Generally speaking, most non-button elements can be clicked to reveal a modal with more information about them. This includes:
- The icons of **Providers**
- The boxes in the sidebar
- The **Components** and **Sources** in the sidebar
- Any **Type** icon

Additionally, the application has modes to show keyboard shortcuts and more detailed information about the **Dashboards** and interface. Feel free to toggle through them using the header, and explore your **Dashboards** in different info modes.

---

## Development Status

This is an early version of the application, so some features are not implemented quite as well or optimized as they could be.

However, the application is in active development, with the goal of improving it in the areas where its implementation is lacking. An expansion of its features is also planned, though the details on the scope of that are currently unclear.

This also means that some things are subject to change in future versions.

> [!info]
> The documentation of the application is currently quite rudimentary. This fact is known and one of the first areas that are likely to change a lot.

---

## Extending and Modifying the Application

It is possible to extend the application by writing custom **Components** and **Provider** APIs for it. However, it is also possible to change the application itself and modify it, in order to fit your needs.

In both cases, there is a `README` that is intended to be used as a guideline for any person interested in the development of these things:
- [Extending the Application](./README_DEV.md) (**Components**, **Provider** APIs)
- [Modifying the Application](./README_MOD.md) (Changing the base functionality)

---

## License
The project is licensed under the [GNU AGPL v3 License](https://www.gnu.org/licenses/agpl-3.0.de.html)

---