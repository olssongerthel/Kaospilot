var conf = require('../config/config'),
    i18n = require('i18n'),
    handlebars = require('handlebars'),
    juice = require('juice'),
    fs = require('fs'),
    nodemailer = require('nodemailer'),
    request = require('request'),
    winston = require('winston');

// Register custom handlebars i18n helper.
handlebars.registerHelper('t', function(string, locale, plural, count) {
  // Default locale to Swedish if undefined or Swedish.
  locale = locale || 0;
  if (!plural || typeof plural != 'boolean') {
    plural = false;
  }
  if (!count || typeof count != 'number') {
    count = false;
  }
  return exports.t(string, locale, plural, count);
});

/**
 * Configure i18n
 */
i18n.configure({
  locales: conf.languages,
  directory: 'locale'
});

/**
 * Default to using file logging if no other Winston transport has
 * been selected.
 */
if (!conf.winstonTransport.module) {
  // Create the log folder if it doesn't exist.
  if (!fs.existsSync('log')){
    fs.mkdirSync('log');
  }
  winston.add(winston.transports.File, { filename: 'log/kaospilot.log' });
} else {
  winston.add(conf.winstonTransport.module, conf.winstonTransport.options);
}

/**
 * Translates a string into another language, given that a translation
 * is available in the 'locale' folder. Translations are stored as JSON files.
 * See https://github.com/mashpie/i18n-node for more information about the format.
 * The folder will be automatically created if it doesn't exist.
 * @param  {String} string - The translatable string. If plural is true, should be
 * the singular value, i.e. '%s cats'
 * @param  {Int}    [locale=0] - The FDT code for the language. Is matched
 * against the 'languages' list in the configuration file.
 * @param  {Boolean} [plural=false] - Set to true if the string is a single phrase with
 * plural support.
 * @param  {Int}     [count] - The number to use to determine whether it's singular or
 * plural. Only used in combination with pluralized strings.
 * @return {String} The translated string.
 */
exports.t = function(string, locale, plural, count) {
  if (plural) {
    return i18n.__n({
      singular: string,
      plural: string,
      locale: conf.languages[locale]
    }, count);
  } else {
    return i18n.__({
      phrase: string,
      locale: conf.languages[locale]
    });
  }
};

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
 * Logs a debug message to the console if debugging is enabled in the
 * configuration file. Useful for debugging plugins.
 * @param  {String} msg - The message you want to log.
 * @param  {Boolean} log - Whether or not to log the message as a
 * debug message using Kalabalik.log()
 */
exports.debug = function(msg, log) {
  if (conf.debug) {
    if (log) {
      exports.log({
        level: 'debug',
        msg: msg
      });
    }
    else {
      console.log(msg);
    }
  } else {
    return;
  }
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
  };

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
 * @param  {Boolean} [options.debug] - If true, saves the composed e-mail as a html file
 * to the debug folder instead of sending it as an e-mail. Respects the value of
 * the global debug setting used in the configuration file.
 * @param  {Function} callback - A callback to run after the e-mail is sent.
 */
exports.composer = function(options, callback) {

  // Debugging is turned on
  if (options.debug || conf.debug) {
    saveToFile(options.mailoptions.html, options.mailoptions.subject + '.html', function(err) {
      if (err) {
        exports.debug(err);
      }
      else {
        // Log the success
        exports.log({msg: 'E-mail "' + options.mailoptions.subject + '" successfully saved to file for debugging.'});
      }
      callback(err);
      return;
    });
  }
  // Debugging is turned off
  else {

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
          msg: error,
          meta: {
            subject: options.mailoptions.subject,
            to: options.mailoptions.to
          }
        });
      } else {
        var recipients = [
          options.mailoptions.to,
          options.mailoptions.cc
        ];
        // Log the success
        exports.log({
          msg: 'E-mail "' + options.mailoptions.subject + '" successfully sent to ' + recipients.join(", ")
        });
        if (callback !== undefined) {
          callback();
        }
      }
    });

  }
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
 * @param  {String} options.method     - The HTTP method to use (GET, PUT) etc.
 * @param  {String} [options.body]     - The body of the request (for PUT etc.)
 * @param  {Object} [options.qs]       - A object containing query string values.
 * @param  {requestCallback} callback  - A callback to run.
 */
exports.kalabalik = function(options, callback) {

  if (conf.debug) {
    var queryParams = [];
    for (var key in options.qs) {
      queryParams.push(key + '=' + options.qs[key]);
    }
    queryParams = queryParams.join('&');
    queryParams = queryParams ? '?' + queryParams : '';
    console.log(options.method + ' data from Kalabalik at ' + options.requestUrl + queryParams);
  }

  // Default to port 80
  conf.kalabalik.port = conf.kalabalik.port ? conf.kalabalik.port : 80;

  // Build the request
  request({
    method: options.method,
    uri: conf.kalabalik.url + ':' + conf.kalabalik.port + options.requestUrl,
    body: options.body,
    qs: options.qs || {},
    json: true,
    auth: {
      user: conf.kalabalik.username,
      pass: conf.kalabalik.password,
      sendImmediately: false
    }
  },
  function (error, response, body) {

    var okResponseCodes = [200, 202];
    var err = {};

    if (error) {
      err.msg = 'An error occured when trying to contact Kalabalik';
      err.request = error;
    }
    else if (okResponseCodes.indexOf(response.statusCode) == -1) {
      err.msg = body;
      err.request = error;
    }

    err = (error || okResponseCodes.indexOf(response.statusCode)  == -1) ? err : null;

    // Log errors when debugging.
    if (err) {
      exports.debug(err);
    }

    callback(err, body);
  });
};

/**
 * Saves html content to a file. Can be used to debug composer
 * e-mails in order to prevent sending them.
 * @param  {string}   content - The html content.
 * @param  {string}   filename - The name of the file.
 * @param  {saveToFileCallback} callback - A callback to run afterwards.
 */
var saveToFile = function(content, filename, callback) {

  var dir = 'debug';

  // Create the debug folder if it doesn't exist.
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  // Write the html file
  fs.writeFile(dir + '/' + filename, content, function(err) {
    if (err) {
      return console.log(err);
    }
    callback(err);
  });
};
