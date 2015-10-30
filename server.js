var fs = require('fs'),
    loader = require('node-glob-loader'),
    kaospilot = require('./app/kaospilot'),
    CronJob = require('cron').CronJob;

// Create a namespace that will hold the plugins.
var plugins = [];

kaospilot.log({
  msg: 'Let the Kaos begin!'
});

// Load all available plugins.
loader.load('./plugins/**/plugin.js', function (plugin, filename) {
  // Bail if it appears to be a broken or incomplete plugin.
  if (!plugin.machine || !plugin.cron || !plugin.pilot) {
    kaospilot.log({
      level: 'error',
      msg: 'Plugin failed to load'
    });
    return;
  }
  kaospilot.log({
    msg: 'Loaded plugin: ' + plugin.label
  });
  plugins.push(plugin);
}).then(function() {
  if (plugins.length) {
    kaospilot.log({
      msg: 'All plugins loaded.'
    });
    // Start the cron daemon
    initialize();
  } else {
    kaospilot.log({
      level: 'error',
      msg: 'No plugins found. Aborting...'
    });
  }
});

// Creates a new cron task for each plugin found.
var initialize = function() {
  for (var i = 0; i < plugins.length; i++) {
    new CronJob(plugins[i].cron, plugins[i].pilot, null, true);
  }
};
