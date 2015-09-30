# What's this?
Kaospilot daemon for FDT Avance. It uses [Kalabalik](https://github.com/olssongerthel/Kalabalik) to access data from FDT Avance and can run pilots (a.k.a small tasks) on interval. For example to send out an e-mail to a customer when a new order has been created, or when an item has arrived in stock.

Kaospilot is very lightweight and only provides three things:

- The ability to set a recurring task at interval
- A wrapper that allow you to send emails via SMTP
- A [Handlebars](http://handlebarsjs.com) template wrapper 

# Plugin, a.k.a _Pilot_
The pilots are small node applications. They can require any node module and act as any node application, but it requires three things:

- A machine readable name (I.e. the name of the plugin using only letters, dashes or underscores)
- A cron setting (i.e. `*/30 * * * * *` or similar)
- A pilot (the task that is to be performed)

Pilots reside in the `plugin` folder and must contain a `plugin.js` file.

**Example folder structure of a plugin**
```
|- send_new_order_email
  |- node_modules
  |- package.json
  |- plugin.js
  |- templates
    |- email.hbs
```

**Example content of plugin.js**
```
exports.label = 'Send purchase order email'; // This is the human readable name (OPTIONAL)
exports.machine = 'send_purchase_order_email'; // Must be the same as the parent folder
exports.cron = '*/30 * * * * *'; // A valid cron string

exports.pilot = function() {
  // Do stuff here
}
```
