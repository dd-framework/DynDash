# Extending the Application

This document serves as an overview for developing new instances of the modular parts of the application (**Components**, **Provider** APIs).

---

## Creating Components

When you develop **Components**, you likely want to test them out. To do this, you would normally have to serve them through a **Component Provider** API as JavaScript modules that have all of their external libraries bundled-in already (with the exception of React and ReactDOM, which need to be accessed from the `window`).

Luckily, this repository already has a helper application called "[Component Compiler](./README_DEV.md#component-compiler)", which does the bundling and serving for you.

Alternatively, you can force the [DynDash](/README.md) application to locally load a **Component**, in order to avoid dealing with bundling and building. To do this, simply:
- Run `npm install` for all the necessary libraries
- Add your **Component** to the `/src/components/dd-components-local` folder
- Use _any_ registered **Component Provider** and serve a **Component** under the same name
    - Its file content should start with `/*! USE LOCAL !*/` (whitespace- and case-insensitive)

> [!TIP]
> When developing a **Component**, it is recommended to look at the default **Components** that are already present in the `/component_compiler/src/` folder, in order to get a good grasp of how a **Component** should look and work.

---

## Component Compiler

As mentioned above, this repository includes a helper-application that allows for the compilation of any **Components** given to it. The helper application is located at `/component_compiler/` and is usually run alongside the other **Provider** applications (or through `npm run component_compiler`).

It is both, a web application and a **Component Provider**, and runs on Port `4433`.

It will compile any **Component** located in its `/src/` directory on startup (and place the results into its `/dist/` directory). The application will also serve all of these **Components**.

This application can also be of use, if you want to develop your own **Component** and serve it through a custom **Provider**, but do not want to deal with the compilation of it. The application offers a very simple web interface which you can visit [here](http://localhost:4433). To compile a **Component**, simply upload your `.js` or `.jsx` file (using the buttons or by dragging the file onto the interface element). The application will start the compilation and provide you with a download of the compiled and bundled **Component**.

> [!IMPORTANT]
> If your **Component** requires any [npm](https://www.npmjs.com) modules, you should install them into the repository of the application through the `npm install` command before running the application.
> 
> Since the Component Compiler is located inside of this repository, it will already have access to the following libraries:
> - [React](https://react.dev)
> - [Recharts](https://recharts.org/en-US/)
> - [Three.js](https://threejs.org)

---

## Custom Events:

The [DynDash](/README.md) application can react to several different events fired inside of its interface (including from **Components**). These events are:

| Event | Purpose |
|-|-|
| `ddSources` | Reloads all connected **Source** information from connected **Source Providers** |
| `ddComponents` | Reloads all connected **Component** information from connected **Component Providers** |
| `ddAlert` | Logs an alert that will be displayed on the associated **Dashboard** |

> #### Example:
> A **Component** is making an API call to a **Provider** registered to the application. This call causes the **Sources** and/or **Components** that the **Provider** advertises to change. However, this change will not be reflected in the UI of the application just yet, since it would require a manual refresh of **Provider** information.

> [!info]
> In the listed example, it would make sense to include the desired event in the response of the API and simply handle dispatching it in the **Component**, to ensure that the event only fires upon receiving a successful response, as opposed to hard-coding the event logic into the **Component** itself.

> [!info]
> The application's alert system needs to be addressed in more detail than the reloading functionality of **Components** and **Sources**. These events should be dispatched from within a **Slot** and be `bubbling`. They are expected to include an `options`-object with a `detail`-object inside. This `detail`-object should contains key-value pairs for `title` and `text`, with an optional pair for `urgency` (which would be an integer value).

---

## Data Types

Data **Types** are a helpful tool to categorize the shape of data. They can be used in arrays found in the definitions of **Components** and **Sources**. These arrays indicate what **Types** of data is included (in the case of **Sources**) or expected (in the case of **Components**).

There are various [DynDash default data Types](./README_DEV.md#default-data-types) (defined in `/src/dd_types.json`), but they can also be entirely customized and provided by a dedicated **Provider** API. **Types** should not be defined with the character `*` in their names, for reasons explained later in this chapter.

Since a **Source** is expected to include data of some kind, it should always have at least one **Type**.

As previously mentioned, it is also best practice to attach a **Types** array to **Components**, indicating what **Type** of **Source** data they expect to be present for rendering. The **Type** array _can_ be used in the `dataValidator` function, but it usually just serves as a simplified representation of what the `dataValidator` will check for.

> [!info]
> Any data **Type** name inside a **Component**'s comptaibility array can be extended with a `*`, in order to signify that said data **Type** is only accepted if it matches more detailed criteria. These additional criteria should be documented in the **Component**'s explanation. The ability to add a `*` to the data **Type** name was introduced in order to prevent the creation of multiple semi-redundant data **Types** that are nearly identical.

**Sources** should only ever be defined with a **Type** array of depth 1. A **Component**'s **Type** array can go deeper than that. It follows _"and/or"_-logic at its base depth of 1 and can include sub-arrays of data **Type** strings, signifying an "and"-coupling of any data **Types** listed in the respective sub-array. Any further nesting is not possible and may cause the **Component** to be ignored by the application.

|                    | Non-Nested Example                                                                                         | Nested Example                                                                                    | Nested Example with Options                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Definition          | `["ddStatus", "ddStream"]`                                                                                 | `[["ddStatus", "ddStream"]]`                                                                      | `[["ddStatus", "ddStream"], "ddURL"]`                                                                                     |
| Logical Expression | `ddStatus \|\| ddStream`                                                                                   | `ddStatus && ddStream`                                                                            | `(ddStatus && ddStream) \|\| ddURL`                                                                                       |
| **Sources**            | A **Source** that provides values for both a `ddStatus` key and a `ddStream` key in its data                   | Do not use                                                                                        | Do not use                                                                                                                |
| **Components**         | A **Component** that can take `ddStatus` data or `ddStream` data, but will work with either one (or even both) | A **Component** that requires both `ddStatus` data and `ddStream` data to be present at the same time | A **Component** that requires either `ddURL` data, OR both `ddStatus` data and `ddStream` data to be present at the same time |

### Default Data Types:
- `ddStream` : **Sources** with this type include the data key 'ddStream', which usually stores an array of objects, each containing at least the key 'name' with an associated value, but also one or more named key-value pairs.
- `ddStatus` : **Sources** with this type include the data key 'ddStatus', which usually stores an object whose keys represent the names of status entries with the associated values representing the content of the status. The values can range from something simple like a number, string, or boolean, to entire objects.
- `ddURL` : **Sources** with this type include the data key 'ddURL', which usually stores an object whose keys represent the names of URL actions. A URL action is represented by an object containing at least the value for the key 'url', with optional key-value pairs for 'method', 'headers', and 'body'. These default to 'POST', {'Content-Type': 'application/json'}, and null, respectively. The value for 'body' is only honored when 'method' is explicitly set to 'POST' or defaults to that value.
- `ddGeneric` : **Sources** with this type usually include entirely custom keys, which usually store entirely custom values.

---

## Custom Providers

Defining a custom **Provider** should be really easy. Whether or not the **Provider** is connected to extensive business logic or just some simple functions is up to each developer.

Similar to the the [Component Compiler](./README_DEV.md#component-compiler), there is also an example **Provider** application in this repository. It is located at `/example_provider/` and is usually run alongside the other **Providers** (or through `npm run example_provider`). Its API spec is written with [API Blueprint](https://apiblueprint.org) and located in the [respective subfolder](./example_provider/API_SPECIFICATION.md).

The example Provider API runs on port `4451`.

---