Prototypo, Streamlining font creation [![Build Status](https://travis-ci.org/byte-foundry/prototypo.svg?branch=master)](https://travis-ci.org/byte-foundry/prototypo)
=====================================

Before installing Prototypo
---------------------------

In order to build Prototypo, you need to install the following software-packages on your system:
- Git
- Node.js
- Grunt
- Bower

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
$ grunt serve
```

Running the Unit Tests
----------------------

```bash
$ grunt test
```

Roadmap to v1.0
===============

- possibility to modify text directly in the preview ([#78](../../issues/78)) ……… ✓
- a complete alphabet with alternates (some numbers, punctuation and accents are missing)
- automatic spacing ([#124](../../issues/124))
- generating binary font-files such as .otf, see the [current workaround](#converting-an-svg-font-to-other-font-formats) ([#12](../../issues/12)) ……… ✓
- personnal library to save and load different fonts ([#125](../../issues/125))
- undo/redo history ([#94](../../issues/94)) ……… ✓

Known issues
------------

- font export is broken in Safari ([#111](../../issues/111))
- the application doesn't adapt to the window being resized ([#108](../../issues/108))


Converting an .svg font to other font formats
---------------------------------------------

This operation currently requires either [Fontforge](http://fontforge.github.io/en-US/) or using a hosted service such as [onlinefontconverter](http://onlinefontconverter.com).

License
=======

[GPLv3](GPL-LICENSE.txt)
