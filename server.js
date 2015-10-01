var fs = require('fs'),
    loader = require('node-glob-loader'),
    CronJob = require('cron').CronJob;

// Create a namespace that will hold the plugins.
var plugins = {};

console.log('Let the Kaos begin!');

// Load all available plugins.
loader.load('./plugins/**/plugin.js', function (plugin, filename) {
  // Bail if it appears to be a broken or incomplete plugin.
  if (!plugin.machine || !plugin.cron || !plugin.pilot) {
    console.log('Plugin failed to load.');
    return;
  }
  console.log('Loaded plugin: ' + plugin.label);
  plugins[plugin.machine] = plugin;
}).then(function() {
  console.log('All plugins loaded.');
  // Start the cron daemon
  initialize();
});

// Creates a new cron task for each plugin found.
var initialize = function() {
  for (var plugin in plugins) {
    new CronJob(plugins[plugin].cron, plugins[plugin].pilot, null, true);
  }
};
