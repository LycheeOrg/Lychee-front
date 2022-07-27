# Lychee-front

**This repository contains the source of the JS frontend in order to allow its use with different backends.**

[![Build Status](https://github.com/LycheeOrg/Lychee-front/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/LycheeOrg/Lychee-front/actions?query=workflow%3A%22Node.js+CI%22)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=LycheeOrg_Lychee-front&metric=alert_status)](https://sonarcloud.io/dashboard?id=LycheeOrg_Lychee-front)

#### A great looking and easy-to-use photo-management-system.

_Since the 1st of April 2018 this project has moved to it's own Organisation (https://github.com/LycheeOrg) where people are able to submit their fixes to it. We, the Organisation owners, want to thank electerious (Tobias Reich) for the opportunity to make this project live on._

![Lychee](https://camo.githubusercontent.com/b9010f02c634219795950e034f511f4cf4af5c60/68747470733a2f2f732e656c6563746572696f75732e636f6d2f696d616765732f6c79636865652f312e6a706567)
![Lychee](https://camo.githubusercontent.com/5484591f0b15b6ba27d4845b292cc5d3a988b3b9/68747470733a2f2f732e656c6563746572696f75732e636f6d2f696d616765732f6c79636865652f322e6a706567)

Lychee is a free photo-management tool, which runs on your server or web-space. Installing is a matter of seconds. Upload, manage and share photos like from a native application. Lychee comes with everything you need and all your photos are stored securely. Read more on our [Website](https://LycheeOrg.github.io).

## Installation

To run Lychee, everything you need is a web-server with PHP 5.5 or later and a MySQL-Database. Follow the instructions to install Lychee on your server. [Installation &#187;](https://github.com/LycheeOrg/Lychee/wiki/Installation)

## API

The frontend send POST requests to the server through. Calls are described in [API &#187;](API.md).

## How to build

If you want to contribute and edit CSS or JS files, you need to rebuild Lychee. [Build &#187;](https://github.com/LycheeOrg/Lychee/wiki/Build)

```sh
# Clone Lychee
git clone https://github.com/LycheeOrg/Lychee.git

# Initialize the frontend submodule
git submodule init

# Get the frontend
git submodule update

# Go into the frontend
cd Lychee-front
```

### Dependencies

First you have to install the following dependencies:

-   `node` [Node.js](http://nodejs.org) v10.0.0 or later
-   `npm` [Node Packaged Modules](https://www.npmjs.org)

After [installing Node.js](http://nodejs.org) you can use the included `npm` package manager to download all dependencies:

```
npm install
```

### Build and Generated Files

The Gulpfile is located in `<path to lychee>/Lychee-front/` and can be executed using the `npm run compile` command.
The generated files will placed into `../dist/` or `<path to lychee>/dist/`.

### :warning: Style formatting

Before submitting a pull request, please apply our formatting rules by executing:

```
npm run format
```

You can also just incorporate a git hook: `.git/hooks/pre-commit`

```
#!/bin/sh
NO_COLOR="\033[0m"
GREEN="\033[38;5;010m"
YELLOW="\033[38;5;011m"

printf "\n${GREEN}pre commit hook start${NO_COLOR}\n"

PRETTIER="./node_modules/prettier/bin-prettier.js"

if [ -x "$PRETTIER" ]; then
    git status --porcelain | grep -e '^[AM]\(.*\).php$' | cut -c 3- | while read line; do
        ${PRETTIER} --write ${line};
        git add "$line";
    done
else
    echo ""
    printf "${YELLOW}Please install prettier, e.g.:${NO_COLOR}"
    echo ""
    echo "  npm install"
    echo ""
fi

printf "\n${GREEN}pre commit hook finish${NO_COLOR}\n"
```

This can easily be installed by doing:

```
cp pre-commit ../../.git/modules/public/Lychee-front/hooks
chmod 755 ../../.git/modules/public/Lychee-front/hooks/pre-commit
```

### Watch for changes

While developing, you might want to use the following command to automatically build Lychee everytime you save a file:

```
npm start
```
