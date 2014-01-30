Prototypo, kickstarting font creation
=====================================

Before installing Prototypo
---------------------------

In order to build Prototypo, you need to install the following software-packages on your system:
- Git
- Node.js
- Grunt
- Bower
- Sass

Installing Prototypo
--------------------

Clone a copy of the main Prototypo git repository

```bash
$ git clone git://github.com/byte-foundry/prototypo.git
```

Enter the Prototypo repository and install build tools

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
$ grunt server
```

Running the Unit Tests
----------------------

```bash
$ grunt test
```