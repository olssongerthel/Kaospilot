var conf = require('../config/config'),
    handlebars = require('handlebars'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
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
 * Generates HTML by supplying the data along with a HBS template to use.
 * @param  {Object} data - A javascript object containing the data.
 * @param  {String} plugin - The machine readable name of the plugin.
 * @param  {String} template - The path to the Handlebars template file.
 * @param  {Function} callback
 * @return {String} - The compiled HTML output.
 */
exports.handlebars = function(data, plugin, template, callback) {

  // Read the template file and use a callback to render
  fs.readFile('plugins/' + plugin + '/templates/' + template, function(err, fileContent){
    if (!err) {
      var source = fileContent.toString();
      renderToString(source, data);
    } else {
      console.log('Something went wrong when attempting to open the template file: ' + err);
      return;
    }
  });

  // Render the output by combining the data with the template.
  function renderToString(source, data) {
    var template = handlebars.compile(source);
    var compiled = template(data);
    callback(compiled);
    return template(compiled);
  }
};

/**
 * Sends an e-mail.
 * @param  {Object} options
 * @param  {Function} callback
 */
exports.composer = function(options, callback) {

  options.transporterOpt = options.transporterOpt ? options.transporterOpt : conf.email.transporterOpt;
  options.mailoptions.to = conf.email.reroute ? conf.email.reroute_address : options.mailoptions.to;

  // Create reusable transporter object using SMTP transport
  transporter = nodemailer.createTransport(options.transporterOpt);

  // Send e-mail with defined transport object
  transporter.sendMail(options.mailoptions, function(error, info){
    console.log(info);
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent.');
      if (callback !== undefined) {
        callback()
      };
    }
  });
};
