var fs = require('fs'),
    loader = require('node-glob-loader'),
    kaospilot = require('./app/kaospilot'),
    CronJob = require('cron').CronJob;

var run = function() {
  kaospilot.log({
    msg: 'Let the Kaos begin!'
  });

  // Load all available plugins.
  loader.load('./plugins/**/plugin.js', function (plugin, filename) {
    // Bail if it appears to be a broken or incomplete plugin.
    if (!pluginTest(plugin)) {
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
}

// Creates a new cron task for each plugin found.
var initialize = function() {
  for (var i = 0; i < plugins.length; i++) {
    new CronJob(plugins[i].cron, plugins[i].pilot, null, true);
  }
};

// Plugin tester
var pluginTest = function(plugin) {
  if (!plugin.machine || !plugin.cron || !plugin.pilot) {
    kaospilot.log({
      level: 'error',
      msg: 'Plugin failed to load.'
    });
    return false;
  }
  else {
    return true;
  }
}

// Single player mode (running a single plugin pilot once).
if (process.env.run) {
  kaospilot.log({
    msg: 'Running Kaospilot in single player mode..'
  });

  // Load the plugin.
  loader.load('./plugins/' + process.env.run + '/plugin.js', function (plugin, filename) {
    if (!pluginTest(plugin)) {
      return
    }
    // Run the plugin's pilot.
    kaospilot.log({
      msg: 'Executing ' + plugin.label
    });
    plugin.pilot();
  });
}
// Continue Kaospilot as usual
else {
  // Create a namespace that will hold the plugins.
  var plugins = [];
  run();
}
