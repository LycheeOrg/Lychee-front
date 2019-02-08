# Lychee-front

**This repository contains the source of the JS frontend in order to allow its use with different backends.**

[![Build Status](https://travis-ci.com/LycheeOrg/Lychee-front.svg?branch=master)](https://travis-ci.com/LycheeOrg/Lychee-front)

#### A great looking and easy-to-use photo-management-system.

*Since the 1st of April 2018 this project has moved to it's own Organisation (https://github.com/LycheeOrg) where people are able to submit their fixes to it. We, the Organisation owners, want to thank electerious (Tobias Reich) for the opportunity to make this project live on.*

![Lychee](https://camo.githubusercontent.com/b9010f02c634219795950e034f511f4cf4af5c60/68747470733a2f2f732e656c6563746572696f75732e636f6d2f696d616765732f6c79636865652f312e6a706567)
![Lychee](https://camo.githubusercontent.com/5484591f0b15b6ba27d4845b292cc5d3a988b3b9/68747470733a2f2f732e656c6563746572696f75732e636f6d2f696d616765732f6c79636865652f322e6a706567)

Lychee is a free photo-management tool, which runs on your server or web-space. Installing is a matter of seconds. Upload, manage and share photos like from a native application. Lychee comes with everything you need and all your photos are stored securely. Try the [Live Demo](https://ld.electerious.com) or read more on our [Website](https://LycheeOrg.github.io).

## Installation

To run Lychee, everything you need is a web-server with PHP 5.5 or later and a MySQL-Database. Follow the instructions to install Lychee on your server. [Installation &#187;](https://github.com/LycheeOrg/Lychee/wiki/Installation)

## API

The frontend send POST requests to the server through. Calls are described in [API &#187;](API.md).

## How to build

If you want to contribute and edit CSS or JS files, you need to rebuild Lychee. [Build &#187;](https://github.com/LycheeOrg/Lychee/wiki/Build)

```sh
# Clone Lychee
git clone https://github.com/LycheeOrg/Lychee.git

# Initialize the submodules (doc and frontend)
git submodule init

# Get the documentations
git submodule update docs

# Get the frontend
git submodule update Lychee-front

# Go into the frontend
cd Lychee-front
```

### Dependencies

First you have to install the following dependencies:

- `node` [Node.js](http://nodejs.org) v5.7.0 or later
- `npm` [Node Packaged Modules](https://www.npmjs.org)

After [installing Node.js](http://nodejs.org) you can use the included `npm` package manager to download all dependencies:

```
npm install
```

### Build and Generated Files

The Gulpfile is located in `<path to lychee>/Lychee-front/` and can be executed using the `npm run compile` command.
The generated files will placed into `../dist/` or `<path to lychee>/dist/`.

### Watch for changes

While developing, you might want to use the following command to automatically build Lychee everytime you save a file:

```
npm start
```
