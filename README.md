Prototypo, Streamlining font creation [![Build Status](https://travis-ci.org/byte-foundry/prototypo.svg?branch=master)](https://travis-ci.org/byte-foundry/prototypo) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/byte-foundry/prototypo?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
=====================================

BEFORE ANYTHING !
-----------------
Use git flow on this branch (reactify-and-cleanup)
Add --no-ff to your merge options on this branch.
If you merge a branch on reactify-and-cleanup with ff I'll be really sad and cry

Labeling convention:
- Feature -> feat/name-of-feature
- Fix -> fix/name-of-fix_issuenumber

Before installing Prototypo
---------------------------

In order to build Prototypo, you need to install the following software-packages on your system:
- Git
- Node.js
- Gulp

Installing Prototypo
--------------------

Clone a copy of the main Prototypo git repository

```bash
$ git clone git://github.com/byte-foundry/prototypo.git && cd prototypo
```

Install build scripts and frontend libraries

```bash
$ npm install
```

Running Prototypo
-----------------

```bash
$ gulp serve
```

You'll want the server to be running on localhost:9000 if you want to connect to our hoodie app.

Running Prototypo with you own Hoodie app
-----------------------------------------

### Requirements
* Install hoodie and its requirements by following the doc (http://docs.hood.ie/en/start/)
* Install adhoc-cors-proxy by running `npm install -g adhoc-cors-proxy`

### Creating and launching the hoodie app (http://docs.hood.ie/en/start/getting-started/getting-started-1.html)
* Create your hoodie app `hoodie new prototypo-hoodie`
* Launch the hoodie app
```bash
$ cd prototypo-hoodie
$ hoodie start
```
* Set up the cors proxy (there is other to circumvent this problem using nginx as a proxy, even without cors, but this is easier)
```bash
 corsproxy <hoodie_couchdb_address>:<hoodie_couchdb_port> --port=<port_you_want_to_access_hoodie_from> --origin=http://localhost:<port_of_prototypo> --credentials
 ```

### Configuring Prototypo
* In `app/scripts/services/hoodie.services.js` line 6 change `backUrl` to
```js
const backUrl = 'http://localhost:<port_you_want_to_access_hoodie_from>';
```
* Launch Prototypo
```bash
gulp serve
```

Roadmap to v1.0
===============

- possibility to modify text directly in the preview ([#78](../../issues/78)) ……… ✓
- a complete alphabet with alternates (some numbers, punctuation and accents are missing)
- automatic spacing ([#124](../../issues/124))
- generating binary font-files such as .otf, see the [current workaround](#converting-an-svg-font-to-other-font-formats) ([#12](../../issues/12)) ……… ✓
- personnal library to save and load different fonts ([#125](../../issues/125))
- <del>undo/redo history</del> ([#94](../../issues/94))

Known issues
------------

- font export is broken in Safari ([#111](../../issues/111))


Converting an .svg font to other font formats
---------------------------------------------

This operation currently requires either [Fontforge](http://fontforge.github.io/en-US/) or using a hosted service such as [onlinefontconverter](http://onlinefontconverter.com).

License
=======

[GPLv3](GPL-LICENSE.txt)
