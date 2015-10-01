var conf = require('../config/config'),
    handlebars = require('handlebars'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    request = require('request'),
    winston = require('winston');

// Set the default winston log type and location.
winston.add(winston.transports.File, { filename: 'log/kaospilot.log' });

/**
 * Generates a log entry.
 * @param  {Object} data - A Winston log object.
 */
exports.log = function(data) {
  winston.log(data.type, data.msg, data.meta);
};

/**
 * Callback for Handlebars.
 *
 * @callback handlebars
 * @param {String} compiled - The compiled HTML.
 */

/**
 * Generates HTML by supplying the data along with a HBS template to use.
 * @param  {Object} options
 * @param  {String} options.plugin - The machine readable name of the plugin.
 * @param  {String} options.template - The name of the template file.
 * The file must be located in a 'templates' folder in the plugin folder and
 * use a '.hbs' file extension.
 * @param  {Object} options.data - A javascript object containing the data.
 * @param  {composer} callback - A callback to run.
 */
exports.handlebars = function(options, callback) {

  var location = 'plugins/' + options.plugin + '/templates/' + options.template + '.hbs';

  // Read the template file and use a callback to render
  fs.readFile(location, function(err, fileContent){
    if (!err) {
      var source = fileContent.toString();
      renderToString(source, options.data);
    } else {
      console.log('Something went wrong when attempting to open the template file: ' + err);
      return;
    }
  });

  // Render the output by combining the data with the template.
  function renderToString(source, data) {
    var template = handlebars.compile(source);
    var compiled = template(data);
    return callback(compiled);
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
  options.mailoptions.to = conf.email.reroute ? conf.email.reroute_address : options.mailoptions.to;

  // Create reusable transporter object using SMTP transport
  transporter = nodemailer.createTransport(options.transporterOpt);

  // Send e-mail with defined transport object
  transporter.sendMail(options.mailoptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent.');
      if (callback !== undefined) {
        return callback();
      }
    }
  });
};

/**
 * Callback for Kalabalik.
 *
 * @callback kalabalik
 * @param {obj} err - An explanation of the error that occured.
 * @param {obj} body - The body of the request response in JSON format.
 */

/**
 * Requests data from an instance of Kalabalik
 * @param  {Object} options
 * @param  {String} options.requestUrl - The request URL incl. "/"
 * @param  {String} options.method - The HTTP method to use (GET, PUT) etc.
 * @param  {String} [options.body] - The body of the request (for PUT etc.)
 * @param  {kalabalik} callback - A callback to run.
 */
exports.kalabalik = function(options, callback) {

  console.log('Fetching data from Kalabalik');

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
