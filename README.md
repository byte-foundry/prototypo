Prototypo, the Font Generator
=============================

Before installing Prototypo
---------------------------

In order to build Prototypo, you need to install the following software-packages on your system:
- Git
- Node.js
- Grunt
- Bower
- Ruby
- Sass

Installing Prototypo
--------------------

Clone a copy of the main Prototypo git repository

```bash
$ git clone git://github.com/byte-foundry/prototypo.git
```

Install build scripts

```bash
$ cd prototypo && npm install
```

Download frontend libraries

```bash
$ bower install
```

Install latest version of Angular

```bash
$ cd app/components/angular-latest && npm install
```

Finally build latest version of Angular

```bash
$ grunt && cd ../../..
```

Running Prototypo
-----------------

```bash
$ grunt serve
```

Converting an .svg font to other font formats
---------------------------------------------

This operation currently requires either [Fontforge](http://fontforge.github.io/en-US/) or using a hosted service such as [Freefontconverter](http://www.freefontconverter.com/).

Running the Unit Tests
----------------------

```bash
$ grunt test
```