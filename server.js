var fs = require('fs'),
    loader = require('node-glob-loader'),
    http = require('http'),
    conf = require('./config/config'),
    kaospilot = require('./app/kaospilot'),
    CronJob = require('cron').CronJob;

var startHttp = function() {
  // Reqest handler
  function handleRequest(request, response){
    var message = function() {
      var string = '\n';
      for (var i = 0; i < plugins.length; i++) {
        string = string + '\n - ' + plugins[i].label;
      }
      return string;
    };
    response.end('Kaospilot is up and running. Enabled plugins:' + message());
  }
  // Create the server
  var server = http.createServer(handleRequest);
  // Listen
  server.listen(conf.port);
};

var run = function() {
  kaospilot.log({
    msg: 'Let the Kaos begin!'
  });

  // Fetch machine names of enabled plugins and create a pattern for glob-loader.
  var enabledPlugins = [];
  for (var plugin in conf.plugins) {
    if (conf.plugins[plugin].enabled) {
      enabledPlugins.push(plugin);
    }
  }
  enabledPlugins = enabledPlugins.join('|');

  // Load all enabled plugins.
  loader.load('./plugins/+(' + enabledPlugins + ')/plugin.js', function (plugin, filename) {
    // Bail if it appears to be a broken or incomplete plugin
    // or if the plugin is not enabled.
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
};

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
};

// Create a namespace that will hold the plugins.
var plugins = [];

// Single player mode (running a single plugin pilot once).
if (process.env.run) {
  kaospilot.log({
    msg: 'Running Kaospilot in single player mode..'
  });

  // Load the plugin.
  loader.load('./plugins/' + process.env.run + '/plugin.js', function (plugin, filename) {
    if (!pluginTest(plugin)) {
      return;
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
  run();

  // Start the status page
  if (conf.port !== false) {
    startHttp();
  }

  // Keep Kaospilot alive on IIS Node hosts. Will GET once per minute.
  if (conf.port !== false && conf.iisnode) {
    var req = function() {
      http.get({
        host: 'localhost',
        port: conf.port
      });
    };
    new CronJob('0 */1 * * * *', req, null, true);
  }
}
