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
</p>
Liteboard provides a platform, where anyone can host a lecture, via webcam, whiteboard, and/or audio! No downloads or account needed! Just create a lecture, and share the link, and viola!

## Contents
- [Requirements](#-requirements)
- [Getting Started](#-getting-started)
- [Environment Variables](#-Environment-Variables)
- [How to Contribute](#-contributing)
- [License](#-License)
- [Contributors](#-CONTRIBUTORS)


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
    cd docker
    cd docker-config
    cd janus
    cp example_janus.jcfg janus.jcfg   # if you want play with janus configs, do it in janus.jcfg
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
    npm run debug # this run it with nodemon
```


## 🌲 Environment Variables

| Variable Name       | Type   | Description                                                                                                                                                            | Allowed                                       |
|---------------------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| NODE_ENV            | string | Sets your environment                                                                                                                                                  | DEVELOPMENT or PRODUCTION                     |
| REDIS_PORT          | number | Sets your redis port. Make sure to only change this if you change the port in your docker-compose file                                                                 | Any                                           |
| REDIS_URL           | string | This is used to connect to your redis instance                                                                                                                         | Follow format as specified in example.dev.env |
| EXPRESS_PORT        | number | Sets the port your app is running on                                                                                                                                   | Any                                           |
| SESSION_SECRET      | string | Sets your express session secret. You usually don't need to touch this unless in PROD environment                                                                      | Any                                           |
| SESSION_NAME        | string | Sets your express session name. You usually don't need to touch this unless in PROD environment                                                                        | Any                                           |
| EMAIL_USERNAME      | string | This is used to send emails. If you are using gmail this is your email, if you are using something like sendGrid, they provide you with username                       | Any                                           |
| EMAIL_SENDER        | string | This used for the "from" value when sending emails. For gmail this is just your email, for something like sendGrid this is your email that is connected to you domain. | Any                                           |
| EMAIL_SERVICE       | string | This specifies the emailing service you use. For gmail it is "GMAIL"                                                                                                   | Any                                           |
| LOGGER              | bool   |                                                                                                                                                                        | True or False                                 |
| JANUS_SERVER_SECRET | string | This is used for janus webrtc gateway authentication. If you change this, please change it in janus config file as well.                                               | Any                                           |
| TURN_SERVER_ACTIVE  | bool   | This specifies if you will be using a turn server. Please keep this false for dev environment                                                                          | True or False                                 |
| SENTRY_DSN          | string | If you want to hook up sentry bug report tracking, use this. If nothing is specified, there will be no issues!                                                         | Any                                           |
| SENTRY_ENVIRONMENT  | string | Use this to track errors for specific sentry environment                                                                                                               | Any                                           |
| DEFAULT_LANGUAGE    | string | Use this to add more languages to liteboard.                                                                                                                           | Any                                           |



## Contributing
We encourge anyone interested, to open Pull Requests!


## 📄 License
Liteboard is MIT licensed. Please refer to license file [here][1]


## ✨ Contributors 

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://lucasnogueira.ca/"><img src="https://avatars0.githubusercontent.com/u/48890798?s=460&u=6c62615de3bc32628e8aec4e8a4c320fe6d77869&v=4" width="100px;" alt=""/><br /><sub><b>Lucas Nogueira</b></sub></a><br /><a href="#question-kentcdodds" title="Answering Questions">💬</a> <a href="https://github.com/jeverd/lecture-experience/commits?author=lnogueirs" title="Documentation">📖</a> <a href="https://github.com/all-contributors/all-contributors/pulls?q=is%3Apr+reviewed-by%3Akentcdodds" title="Reviewed Pull Requests">👀</a> <a href="#talk-kentcdodds" title="Talks">📢</a></td>
    <td align="center"><img src="https://avatars3.githubusercontent.com/u/66929827?s=460&u=34131fcf10cbd8918da4fa95ac807c4b75e36714&v=4" width="100px;" alt=""/><br /><sub><b>Lukas Müller</b></sub></a><br /><a href="https://github.com/all-contributors/all-contributors/commits?author=jfmengels" title="Documentation">📖</a> <a href="https://github.com/all-contributors/all-contributors/pulls?q=is%3Apr+reviewed-by%3Ajfmengels" title="Reviewed Pull Requests">👀</a> <a href="#tool-jfmengels" title="Tools">🔧</a></td>
    <td align="center"><a href=""><img src="https://avatars0.githubusercontent.com/u/46453568?s=460&u=a8441d4ed98a18b8b937c29d84742074d340b173&v=4" width="100px;" alt=""/><br /><sub><b>Jawad Bhimani</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=jeverd" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.aasirvalji.com/"><img src="https://avatars2.githubusercontent.com/u/45238682?s=460&u=17011f159eecbdc2aad99719c24d4b178e0618ae&v=4" width="100px;" alt=""/><br /><sub><b>Aasir Valji</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=aasirvalji" title="Documentation">📖</a></td>
    <td align="center"><img src="https://avatars0.githubusercontent.com/u/35204758?s=460&v=4" width="100px;" alt=""/><br /><sub><b>SultanEm</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=SultanEm" title="Documentation">📖</a></td>
    <td align="center"><img src="https://avatars2.githubusercontent.com/u/55399020?s=460&u=6ffb1175921b2a38be05ec26ac4fa3dd66beb62d&v=4" width="100px;" alt=""/><br /><sub><b>Gabriel Lemos Rodrigues</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=Lemos00" title="Documentation">📖</a></td>
    <td align="center"><img src="https://avatars1.githubusercontent.com/u/35978975?s=460&u=05153ea0426075ea9edf9960bdd2443e167b31ce&v=4" width="100px;" alt=""/><br /><sub><b>Michael DeMarco</b></sub></a><br /><a href="https://github.com/jeverd/lecture-experience/commits?author=michaelfromyeg" title="Documentation">📖</a></td>
  </tr>
</table>




[1]: https://github.com/jeverd/lecture-experience/blob/master/LICENSE
