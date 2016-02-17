# What's this?
Kaospilot daemon for FDT Avance. It uses [Kalabalik](https://github.com/olssongerthel/Kalabalik) to access data from FDT Avance and can run pilots (a.k.a small tasks) on interval. For example to send out an e-mail to a customer when a new order has been created, or when an item has arrived in stock.

Kaospilot is very lightweight and only provides a couple of things:

- The ability to set a recurring task at interval
- A wrapper that allow you to send emails via SMTP
- A wrapper that simplifies Kalabalik requests
- A [Handlebars](http://handlebarsjs.com) template wrapper

# Installation
1. Grab the [latest release](https://github.com/olssongerthel/Kaospilot/releases/latest) or clone it.
2. Unzip/Unpack and go to the folder
3. Copy and rename config.default.js: `cp config/config.default.js config.js` and configure config.js.
4. Install dependencies: `npm install --production`
5. Create the ‘plugins’ folder in the root directory of Kaospilot and add the plugins you want to use (in plugins folder).
6. Run Kaospilot: `node server.js` or `npm start`

Your plugin daemons should now be up and running!

# Plugins
Plugins are the daemons, or scheduled tasks, that are run by Kaospilot. They are small node applications. They can require any node module and act as any node application, but it requires three things:

- A machine readable name (I.e. the name of the plugin using only letters, dashes or underscores)
- A cron setting (i.e. `*/30 * * * * *` or similar)
- A pilot (the task that is to be performed)

Plugins reside in the `plugin` folder and must contain a `plugin.js` file.

**Example folder structure of a plugin**
```
|- send_new_order_email
  |- css
    |- email.css
  |- node_modules
  |- package.json
  |- plugin.js
  |- templates
    |- email.hbs
```

**Example content of plugin.js**
```
var kaospilot = require('../../app/kaospilot');
exports.label = 'Send purchase order email'; // This is the human readable name (OPTIONAL)
exports.machine = 'send_purchase_order_email'; // Must be the same as the parent folder
exports.cron = '*/30 * * * * *'; // A valid cron string

exports.pilot = function() {
  // Do stuff here using the Kaospilot API
}
```

## API

See [API documentation](app/api.md) for complete documentation of the Kaospilot API.

## Internationalization

Kaospilot supports translation of strings in plugins, both as a stand-alone helper function (see kaospilot.t) and as a Handlebars helper. Translatable strings must be added in english. All translations are global, meaning that a translated string cannot differ from plugin to plugin. Translations are kept, and not versioned, in the "locale" folder.

Handlebars template implementation looks like this:

`{{t "Order"}}`

## Developing plugins

When developing new plugins, you can run them using the process variable `run`. This makes it possible to run a single plugin once which is convenient for development purposes:

`run=plugin_machine_name node server.js`
