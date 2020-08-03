<h1 align="center">
  <a href="http://liteboard.io/">
    Liteboard.io
  </a>
</h1>
<p align="center">
  <a href="https://github.com/jeverd/lecture-experience/graphs/contributors" alt="Contributors">
        <img src="https://img.shields.io/github/contributors/jeverd/lecture-experience" /></a>
  <a href="https://github.com/jeverd/lecture-experience/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Liteboard is released under the MIT license." />
  </a>
  <a href="https://circleci.com/">
    <img src="https://circleci.com/gh/jeverd/lecture-experience.svg?style=shield&circle-token=:circle-token" 
    alt="Current CircleCI build status." />
  <a href="https://github.com/jeverd/lecture-experience/pulse" alt="Activity">
        <img src="https://img.shields.io/github/commit-activity/m/jeverd/lecture-experience" /></a>
  </a>
  <a href="https://github.com/jeverd/lecture-experience">
    <img src="https://img.shields.io/badge/Repo-Link-orange.svg" 
     alt="Repo Link" />
  </a>
  <a href="https://discord.gg/BH4akDY">
        <img src="https://img.shields.io/discord/703452000951730177?logo=discord"
            alt="chat on Discord"></a>
  </a>
</p>

Liteboard is a free, browser-based lecturing platform for anyone who wants to quickly setup a real-like classroom with State-of-the-Art drawing tools and webcam/audio broadcasts. We don't support cumbersome setups; no downloads or accounts required! Just create a lecture, and share the link. It's really that simple.

<div style="margin: 5px 0px;">
  <img src="public/images/github-readme-main.png"/>
</div>

Liteboard is powered by WebRTC and uses the [Janus](https://github.com/meetecho/janus-gateway) implementation of a Selective Forwarding Unit (SFU) to allow multiple participants per lecture while ensuring the lowest latency available on browsers. We host our own TURN server to guarantee support for users in any kind of network.


## Contents

<img align="right" style="border-radius:0.25rem;" width="375" height="auto" src="public/images/github-readme-main2.png"/>

- [Contents](#contents)
- [💡 Features](#-features)
- [📝 Requirements](#-requirements)
- [🏃 Getting Started](#-getting-started)
    - [Clone](#clone)
    - [Setup](#setup)
- [🌲 Environment Variables](#-environment-variables)
- [🔊 Contributing](#-contributing)
- [✨ Team](#-team)


## 💡 Features
  
  <img align="right" style="border-radius:0.25rem;" width="375" height="auto" src="public/images/github-readme-stats.png"/>

  - Live audio/video transmissions
  - High Quality live drawing boards
  - Chat rooms supporting text and attachments
  - Quick-to-setup lectures - no download or accounts
  - SFU infrastucture allowing multiple attendees
  - Lecture metrics with graphical interface
  - i18n - Portuguese | English

## 📝 Requirements

To run liteboard locally, you will need the following:
   - [Node](https://nodejs.org/en/download/)
   - [Docker and Docker compose](https://docs.docker.com/get-docker/)


## 🏃 Getting Started
##### Clone
- Clone this repo by running the following command `git clone https://github.com/jeverd/lecture-experience.git`

#### Setup
- Starting up docker containers
> generating janus configuration file
```shell
    cd docker/docker-config
    cp janus/example_janus.jcfg janus/janus.jcfg # if you want play with janus configs, do it in janus.jcfg
```
> now we can start up our `janus` and `redis` containers
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
    npm start
```


## 🌲 Environment Variables

| Variable Name       | Type   | Description                                                                                                                                                            | Allowed                                       |
|---------------------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| NODE_ENV            | string | Your environment, just keep DEVELOPMENT to work locally                                                                                                                                                  | DEVELOPMENT , PRODUCTION , STAGING                    |
| REDIS_PORT          | number | Sets your redis port. Make sure to only change this if you change the port in your docker-compose file                                                                 | Any                                           |
| REDIS_URL           | string | This is used to connect to your redis instance                                                                                                                         | Follow format as specified in example.dev.env |
| EXPRESS_PORT        | number | Sets the port your app is running on                                                                                                                                   | Any                                           |
| SESSION_SECRET      | string | Sets your express session secret. You usually don't need to touch this unless in PROD environment                                                                      | Any                                           |
| SESSION_NAME        | string | Sets your express session name. You usually don't need to touch this unless in PROD environment                                                                        | Any                                           |
| EMAIL_USERNAME      | string | This is used to send emails. If you are using gmail this is your email, if you are using something like sendGrid, they provide you with username                       | Any                                           |
| EMAIL_SENDER        | string | This used for the "from" value when sending emails. For gmail this is just your email, for something like sendGrid this is your email that is connected to you domain. | Any                                           |
| EMAIL_SERVICE       | string | This specifies the emailing service you use. For gmail it is "GMAIL"                                                                                                   | Any                                           |
| LOGGER              | bool   |                                                                                                                                                                        | true or false                                 |
| JANUS_SERVER_SECRET | string | This is used for janus webrtc gateway authentication. If you change this, please change it in janus config file as well.                                               | Any                                           |
| TURN_SERVER_ACTIVE  | bool   | This specifies if you will be using a turn server. Please keep this false for dev environment                                                                          | true or false                                 |
| SENTRY_DSN          | string | If you want to hook up sentry bug report tracking, use this. If nothing is specified, there will be no issues!                                                         | Any                                           |
| SENTRY_ENVIRONMENT  | string | Use this to track errors for specific sentry environment                                                                                                               | Any                                           |
| DEFAULT_LANGUAGE    | string | Sets the Liteboards default language.                                                                                                                           | en-US, pt-BR                                          |



## 🔊 Contributing
We encourge anyone interested in contributing to our project to open Pull Requests and Issues about bugs or cool features to implement. We use discord to communicate. Feel free to join the [Liteboard server](https://discord.gg/BH4akDY)!


## ✨ Team 
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/lnogueir">
      <img src="https://avatars0.githubusercontent.com/u/48890798?s=460&u=6c62615de3bc32628e8aec4e8a4c320fe6d77869&v=4" width="100px;" alt=""/><br /><sub><b>Lucas Nogueira</b></sub></a><br /> 
        <a href="https://github.com/jeverd/lecture-experience/commits?author=lnogueir"           title="Commits">📖</a> 
        <a href="https://lucasnogueira.ca/">🔗</a>
        <a href="https://devpost.com/lnogueir">💻</a>
    </td>
    <td align="center"><a href="https://github.com/lukasmuller10"><img src="https://avatars3.githubusercontent.com/u/66929827?s=460&u=34131fcf10cbd8918da4fa95ac807c4b75e36714&v=4" width="100px;" alt=""/><br /><sub><b>Lukas Müller</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=lukasmuller10" title="Commits">📖</a>
    <a href="https://lukasmuller.me/">🔗</a>
    <a href="https://www.linkedin.com/in/lukas-müller-de-oliveira-437b08189">💼</a>
    </td>
    <td align="center"><a href="https://github.com/jeverd"><img src="https://avatars0.githubusercontent.com/u/46453568?s=460&u=a8441d4ed98a18b8b937c29d84742074d340b173&v=4" width="100px;" alt=""/><br /><sub><b>Jawad Bhimani</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=jeverd" title="Commits">📖</a>
    <a href="https://jbhimani.me/">🔗</a>
    <a href="https://ca.linkedin.com/in/jawadbhimani">💼</a>
    </td>
    <td align="center"><a href="https://github.com/aasirvalji"><img src="https://avatars2.githubusercontent.com/u/45238682?s=460&u=17011f159eecbdc2aad99719c24d4b178e0618ae&v=4" width="100px;" alt=""/><br /><sub><b>Aasir Valji</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=aasirvalji" title="Commits">📖</a>
    <a href="https://www.aasirvalji.com/">🔗</a>
    <a href="https://www.linkedin.com/in/aasir-valji/">💼</a>
    </td>
    <td align="center"><a href="https://github.com/SultanEm"><img src="https://avatars0.githubusercontent.com/u/35204758?s=460&v=4" width="100px;" alt=""/><br /><sub><b>Sultan Emaish</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=SultanEm" title="Commits">📖</a>
    </td>
    <td align="center"><a href="https://github.com/Lemos00"><img src="https://avatars2.githubusercontent.com/u/55399020?s=460&u=6ffb1175921b2a38be05ec26ac4fa3dd66beb62d&v=4" width="100px;" alt=""/><br /><sub><b>Gabriel Lemos</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=Lemos00" title="Commits">📖</a>
    <a href="https://ca.linkedin.com/in/gabriel-lemos-rodrigues-b96824198">💼</a>
    </td>
    <td align="center"><a href="https://github.com/michaelfromyeg"><img src="https://avatars1.githubusercontent.com/u/35978975?s=460&u=05153ea0426075ea9edf9960bdd2443e167b31ce&v=4" width="100px;" alt=""/><br /><sub><b>Michael DeMarco</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=michaelfromyeg" title="Commits">📖</a>
    <a href="https://michaeldemar.co/">🔗</a>
    </td>
  </tr>
</table>




[1]: https://github.com/jeverd/lecture-experience/blob/master/LICENSE
