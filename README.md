<h1 align="center">
  <a href="http://liteboard.io/">
    Liteboard.io - Lecturing Platform
  </a>
</h1>
<p align="center">
  <a href="https://github.com/jeverd/lecture-experience/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="React Native is released under the MIT license." />
  </a>
  <a href="https://circleci.com/">
    <img src="https://circleci.com/gh/jeverd/lecture-experience.svg?style=shield&circle-token=:circle-token" 
    alt="Current CircleCI build status." />
  </a>
  <a href="https://www.npmjs.org/package/react-native">
    <img src="https://badge.fury.io/js/react-native.svg" alt="Current npm package version." />
  </a>
</p>
Liteboard provides a platform, where anyone can host a lecture, via webcam, whiteboard, and/or audio! No downloads or account needed! Just create a lecture, and share the link, and viola!

## Contents
- [Requirements](#-requirements)
- [Getting Started](#-building-your-first-react-native-app)
- [Environment Variables](#-documentation)
- [Upgrading](#-upgrading)
- [How to Contribute](#-how-to-contribute)
- [Code of Conduct](#code-of-conduct)
- [License](#-license)


## 📝  Requirements

To run liteboard locally, you will need the following:
   - [Node](https://nodejs.org/en/download/)
   - [Docker and Docker compose](https://docs.docker.com/get-docker/)


## 📝  Getting Started
##### Clone
- Clone this repo by running the following command `git clone https://github.com/jeverd/lecture-experience.git`

#### Setup
- Starting up docker containers
> generating janus configuration file
```shell
    cd docker
    cd docker-config
    cd janus
    cp example_janus.jcfg janus.jcfg   # if you want play with janus configs, do it in janus.jcfg
```
> now we start up our `janus` and `redis` containers
```shell
    cd .. # assuming you are in the docker-config directory
    docker-compose up -d  # this will start up redis and janus containers
```
- Installing dependencies
> now navigate to the root directory and install npm packages
```shell
    npm install 
```
- Creating `.env` file
> navigate to the config directory, create `.env` file, and then copy contents of `example.dev.env` into the file
```shell
    cd config # assuming you are in root directory
    cp example.dev.env .env  #more info on env var below
```
- Running the App
> now we can start the app
```shell
    npm run debug # this run it with nodemon
```

#### Environment Variables

| Variable Name       | Type             | Description   | Environment                                                                                                                                                               |
| ---------------- | ---------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV | string | true | 
| allowChildInteraction | bool| true | By default, the user can touch and interact with the child element. When this prop is false, the user cannot interact with the child element while the tooltip is visible. |
| arrowSize        | `Size`           | { width: 16, height: 8 }               | The dimensions of the arrow on the bubble pointing to the highlighted element                                                                                                                                  |
| backgroundColor  | string           | 'rgba(0,0,0,0.5)'                      | Color of the fullscreen background beneath the tooltip. **_Overrides_** the `backgroundStyle` prop                                                                                                             |
| childContentSpacing | number | 4 | The distance between the tooltip-rendered child and the arrow pointing to it |
| closeOnChildInteraction | bool | true | When child interaction is allowed, this prop determines if `onClose` should be called when the user interacts with the child element. Default is true (usually means the tooltip will dismiss once the user touches the element highlighted) |
| closeOnContentInteraction | bool | true | this prop determines if `onClose` should be called when the user interacts with the content element. Default is true (usually means the tooltip will dismiss once the user touches the content element) |
| content          | function/Element | `<View />`                             | This is the view displayed in the tooltip popover bubble                                                                                                                                                       |
| displayInsets | object | { top: 24, bottom: 24, left: 24, right: 24 } | The number of pixels to inset the tooltip on the screen (think of it like padding). The tooltip bubble should never render outside of these insets, so you may need to adjust your `content` accordingly |
| isVisible        | bool             | false                                  | When true, tooltip is displayed                                                                                                                                                                                |                                                            |
| onClose          | function         | null                                   | Callback fired when the user taps the tooltip background overlay                                                                                                                                               |
| placement        | string           | "top" \| "center"                                  | Where to position the tooltip - options: `top, bottom, left, right, center`. Default is `top` for tooltips rendered with children Default is `center` for tooltips rendered without children. <br><br>NOTE: `center` is only available with a childless placement, and the content will be centered within the bounds defined by the `displayInsets`. |
| showChildInTooltip | bool | true | Set this to `false` if you do NOT want to display the child alongside the tooltip when the tooltip is visible |
| supportedOrientations | array | ["portrait", "landscape"] | This prop allows you to control the supported orientations the tooltip modal can be displayed. It correlates directly with [the prop for React Native's Modal component](https://facebook.github.io/react-native/docs/modal#supportedorientations) (has no effect if `useReactNativeModal` is false) |
| topAdjustment          | number         | 0                                   | Value which provides additional vertical offest for the child element displayed in a tooltip. Commonly set to: `Platform.OS === 'android' ? -StatusBar.currentHeight : 0` due to an issue with React Native's measure function on Android
| useInteractionManager | bool | false | Set this to true if you want the tooltip to wait to become visible until the callback for `InteractionManager.runAfterInteractions` is executed. Can be useful if you need to wait for navigation transitions to complete, etc. [See docs on InteractionManager here](https://facebook.github.io/react-native/docs/interactionmanager)
| useReactNativeModal | bool| true | By default, this library uses a `<Modal>` component from React Native. If you need to disable this, and simply render an absolutely positioned full-screen view, set `useReactNativeModal={false}`. This is especially useful if you desire to render a Tooltip while you have a different `Modal` rendered.



<!-- [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/master/LICENSE) [![CircleCI Status](https://circleci.com/gh/jeverd/lecture-experience.svg?style=shield&circle-token=:circle-token)]()

React is a JavaScript library for building user interfaces.

* **Declarative:** React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes. Declarative views make your code more predictable, simpler to understand, and easier to debug.
* **Component-Based:** Build encapsulated components that manage their own state, then compose them to make complex UIs. Since component logic is written in JavaScript instead of templates, you can easily pass rich data through your app and keep state out of the DOM.
* **Learn Once, Write Anywhere:** We don't make assumptions about the rest of your technology stack, so you can develop new features in React without rewriting existing code. React can also render on the server using Node and power mobile apps using [React Native](https://reactnative.dev/).

[Learn how to use React in your own project](https://reactjs.org/docs/getting-started.html).

## Installation

React has been designed for gradual adoption from the start, and **you can use as little or as much React as you need**:

* Use [Online Playgrounds](https://reactjs.org/docs/getting-started.html#online-playgrounds) to get a taste of React.
* [Add React to a Website](https://reactjs.org/docs/add-react-to-a-website.html) as a `<script>` tag in one minute.
* [Create a New React App](https://reactjs.org/docs/create-a-new-react-app.html) if you're looking for a powerful JavaScript toolchain.

You can use React as a `<script>` tag from a [CDN](https://reactjs.org/docs/cdn-links.html), or as a `react` package on [npm](https://www.npmjs.com/package/react).

## Documentation

You can find the React documentation [on the website](https://reactjs.org/docs).  

Check out the [Getting Started](https://reactjs.org/docs/getting-started.html) page for a quick overview.

The documentation is divided into several sections:

* [Tutorial](https://reactjs.org/tutorial/tutorial.html)
* [Main Concepts](https://reactjs.org/docs/hello-world.html)
* [Advanced Guides](https://reactjs.org/docs/jsx-in-depth.html)
* [API Reference](https://reactjs.org/docs/react-api.html)
* [Where to Get Support](https://reactjs.org/community/support.html)
* [Contributing Guide](https://reactjs.org/docs/how-to-contribute.html)

You can improve it by sending pull requests to [this repository](https://github.com/reactjs/reactjs.org).

## Examples

We have several examples [on the website](https://reactjs.org/). Here is the first one to get you started:

```jsx
function HelloMessage({ name }) {
  return <div>Hello {name}</div>;
}

ReactDOM.render(
  <HelloMessage name="Taylor" />,
  document.getElementById('container')
);
```

This example will render "Hello Taylor" into a container on the page.

You'll notice that we used an HTML-like syntax; [we call it JSX](https://reactjs.org/docs/introducing-jsx.html). JSX is not required to use React, but it makes code more readable, and writing it feels like writing HTML. If you're using React as a `<script>` tag, read [this section](https://reactjs.org/docs/add-react-to-a-website.html#optional-try-react-with-jsx) on integrating JSX; otherwise, the [recommended JavaScript toolchains](https://reactjs.org/docs/create-a-new-react-app.html) handle it automatically.

## Contributing

The main purpose of this repository is to continue evolving React core, making it faster and easier to use. Development of React happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving React.

### [Code of Conduct](https://code.fb.com/codeofconduct)

Facebook has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](https://code.fb.com/codeofconduct) so that you can understand what actions will and will not be tolerated.

### [Contributing Guide](https://reactjs.org/contributing/how-to-contribute.html)

Read our [contributing guide](https://reactjs.org/contributing/how-to-contribute.html) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to React.

### Good First Issues

To help you get your feet wet and get you familiar with our contribution process, we have a list of [good first issues](https://github.com/facebook/react/labels/good%20first%20issue) that contain bugs which have a relatively limited scope. This is a great place to get started.

### License

React is [MIT licensed](./LICENSE). -->