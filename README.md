# generator-angular-fullstack-crud [![Build Status](https://secure.travis-ci.org/MartyIce/generator-angular-fullstack-crud.png?branch=master)](https://travis-ci.org/MartyIce/generator-angular-fullstack-crud)

> [Yeoman](http://yeoman.io) generator


## Getting Started

### What is Yeoman?

Trick question. It's not a thing. It's this guy:

![](http://i.imgur.com/JHaAlBJ.png)

Basically, he wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create.

Not every new computer comes with a Yeoman pre-installed. He lives in the [npm](https://npmjs.org) package repository. You only have to ask for him once, then he packs up and moves into your hard drive. *Make sure you clean up, he likes new and shiny things.*

```bash
$ npm install -g yo
```

### Yeoman Generators

To install generator-angular-fullstack-crud from npm, run:

```bash
$ npm install -g generator-angular-fullstack-crud
```

Next, ensure you have a (mostly?) blank version of an angular-fullstack site.  For best results, execute the generator against a completely fresh/new angular-fullstack site.

This can be accomplished by creating a new directory, and generating:

```bash
$ yo angular-fullstack
```

Next, create a config.json file to drive the crud generation.  The angular-fullstack-crud generator comes with an example file, config.json.  Copy that into the root of your new angular-fullstack site, and run the following:

```bash
$ yo angular-fullstack-crud
```

Using the values found in the config file, the generator will add views, controllers, models, etc to add the configured CRUD objects to your application.

There are certain blocks of code that need to be injected into existing files (for example, the routes file).  There are two ways the angular-fullstack-crud generator can accomplish this:

1) If being executed for the first time, it will look for certain code signatures in the newly generated angular-fullstack site, and inject there.  It will also leave "markers" that it uses for subsequent generation.

2) If being executed again against a site, it will rely on the "markers" to know where to inject code.  The markers will look something like this:

    // ROUTE INCLUDES BEGIN
    // ROUTE INCLUDES END

This process is a little fragile, and will work incorrectly if the existing angular-fullstack code looks differently than what the generator expects.  For best results, use the "marker" paradigm, and code will always be injected into the correct place.

## License

MIT
