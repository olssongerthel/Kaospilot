var conf = require('../config/config'),
    handlebars = require('handlebars'),
    juice = require('juice'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    request = require('request'),
    winston = require('winston');

// Default to using file logging if no other Winston transport has been selected.
if (!conf.winstonTransport.module) {
  winston.add(winston.transports.File, { filename: 'log/kaospilot.log' });
} else {
  winston.add(conf.winstonTransport.module, conf.winstonTransport.options);
}

/**
 * Generates a log entry.
 * @param  {Object} data - A Winston log object.
 * @param  {Object} data.meta
 * @param  {String} data.meta.plugin - The human readable name of your plugin,
 * i.e the same as exports.label from your plugin.
 */
exports.log = function(data) {
  data.level = data.level ? data.level : 'info';
  data.meta = data.meta ? data.meta : null;
  winston.log(data.level, data.msg, data.meta);
};

/**
 * Callback for Handlebars.
 *
 * @callback templateCallback
 * @param {String} compiled - The compiled HTML.
 */

/**
 * Generates HTML by supplying the data along with a HBS template to use.
 * @param  {Object} options
 * @param  {String} options.plugin - The machine readable name of the plugin.
 * @param  {String} options.template - The name of the template file.
 * The file must be located in a 'templates' folder in the plugin folder and
 * use a '.hbs' file extension.
 * @param  {String} [options.css] - The name of the css file incl. extension
 * to apply inline. Must be located in a 'css' folder in the plugin folder.
 * @param  {Object} options.data - A javascript object containing the data.
 * @param  {templateCallback} callback - A callback to run.
 */
exports.handlebars = function(options, callback) {

  var templateLocation = 'plugins/' + options.plugin + '/templates/' + options.template + '.hbs';
  var css = '';

  // Opens a plugin CSS file and returns its content as a string in a callback.
  var fetchCss = function(callback) {
    var cssLocation = 'plugins/' + options.plugin + '/css/' + options.css;
    fs.readFile(cssLocation, function(err, fileContent){
      if (!err) {
        css = fileContent.toString();
        callback(css);
      } else {
        console.log('Something went wrong when attempting to open the css file: ' + err);
        return;
      }
    });
  }

  // Read the template file and use a callback to render
  fs.readFile(templateLocation, function(err, fileContent){
    if (!err) {
      var source = fileContent.toString();
      if (options.css) {
        fetchCss(function() {
          renderToString(source, options.data);
        });
      } else {
        renderToString(source, options.data);
      }
    } else {
      console.log('Something went wrong when attempting to open the template file: ' + err);
      return;
    }
  });

  // Render the output by combining the data with the template.
  function renderToString(source, data) {
    var template = handlebars.compile(source);
    var compiled = template(data);
    if (options.css) {
      juice.juiceResources(compiled, {
        extraCss: css,
        applyStyleTags: true
      }, function(err, html){
        if (!err) {
          callback(html);
        }
      });
    } else {
      return callback(compiled);
    }
  }
};

/**
 * Sends an e-mail via SMTP.
 * @param  {Object} options
 * @param  {String} [options.transporterOpt] - A valid Nodemailer transporter
 * options object. See Nodemailer module docs for more info.
 * @param  {String} options.mailoptions - A valid Nodemailer mailoptions
 * object. See Nodemailer module docs for more info.
 */
exports.composer = function(options, callback) {

  options.transporterOpt = options.transporterOpt ? options.transporterOpt : conf.email.transporterOpt;

  // Reroute all outgoing e-mails if rerouting is enabled. CC and BCC are disabled.
  options.mailoptions.to = conf.email.reroute ? conf.email.reroute_address : options.mailoptions.to;
  options.mailoptions.cc = conf.email.reroute ? null : options.mailoptions.cc;
  options.mailoptions.bcc = conf.email.reroute ? null : options.mailoptions.bcc;

  // Create reusable transporter object using SMTP transport
  transporter = nodemailer.createTransport(options.transporterOpt);

  // Send e-mail with defined transport object
  transporter.sendMail(options.mailoptions, function(error, info){
    if (error) {
      // Log the error
      exports.log({
        level: 'error',
        msg: err,
        meta: {
          plugin: 'Kaospilot'
        }
      });
    } else {
      var recipients = [
        options.mailoptions.to,
        options.mailoptions.cc
      ];
      // Log the success
      exports.log({
        msg: 'E-mail "' + options.mailoptions.subject + '" successfully sent to ' + recipients.join(", "),
        meta: {
          plugin: 'Kaospilot'
        }
      });
      if (callback !== undefined) {
        return callback();
      }
    }
  });
};

/**
 * Callback for Kalabalik.
 *
 * @callback requestCallback
 * @param {obj} err - An explanation of the error that occured.
 * @param {obj} body - The body of the request response in JSON format.
 */

/**
 * Requests data from an instance of Kalabalik
 * @param  {Object} options
 * @param  {String} options.requestUrl - The request URL incl. "/"
 * @param  {String} options.method - The HTTP method to use (GET, PUT) etc.
 * @param  {String} [options.body] - The body of the request (for PUT etc.)
 * @param  {requestCallback} callback - A callback to run.
 */
exports.kalabalik = function(options, callback) {

  console.log('Fetching data from Kalabalik at ' + options.requestUrl);

  // Default to port 80
  conf.kalabalik.port = conf.kalabalik.port ? conf.kalabalik.port : 80;

  // Build the request
  request({
    method: options.method,
    uri: conf.kalabalik.url + ':' + conf.kalabalik.port + options.requestUrl,
    body: options.body,
    json: true,
    auth: {
      user: conf.kalabalik.username,
      pass: conf.kalabalik.password,
      sendImmediately: false
    }
  },
  function (error, response, body) {

    var err = {};

    if (error) {
      err.msg = 'An error occured when trying to contact Kalabalik';
      err.request = error;
    }
    else if (response.statusCode !== 200) {
      err.msg = body;
      err.request = error;
    }

    err = (error || response.statusCode !== 200) ? err : null;

    return callback(err, body);
  });
};
