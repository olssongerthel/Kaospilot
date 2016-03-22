// Enabled plugins
var plugins = {
  example_plugin_folder: {
    enabled: true
  }
};

// Kalabalik API URL and credentials.
var kalabalik = {
  url: '',
  username: '',
  password: '',
  port: 80
}

// E-mail settings
var email = {
  reroute: false, // Set to true to redirect all e-mails sent via Composer.
  reroute_address: '', // E-mail recipient for redirected e-mails.
  transporterOpt: { // A valid Nodemailer transporter options object
    service: '', // I.e. 'gmail'
    auth: {
      user: '',
      pass: ''
    }
  }
}

/**
 * Optional Winston logging transport. Defaults to file logging if not
 * specified. You can add a logging transport by installing it as a module,
 * i.e.'npm install winston-slack' and add its options to this variable.
 * @type {Object}   winstonTransport
 * @type {Function} winstonTransport.module - The required module.
 * @type {Object}   winstonTransport.options - The options for the specific
 * transport. Will vary from module to module. See that transports's docs.
 */
var winstonTransport = {
  // module: require(''),
  // options: {}
}

/**
 * Add the languages you will use with Kaospilot. This setting is required for
 * plugins to be able to use localization (kaospilot.t) properly. The languages
 * have to match the order that is used in FDT Avance. 0 is always swedish.
 * If unsure, leave as is.
 * @type {Array}  languages
 * @type {String} languages[] - A valid language code (i.e. 'sv' or 'dk').
 */
var languages = [
  'sv',
  'en',
  'de',
  'fr',
  'fi',
  'no',
  'da'
];

/**
 * Can be used to debug plugins during development. The variable must however
 * be used by the plugins themselves in order to function.
 * @type {Boolean}
 */
var debug = false;

/**
 * The port to use for the HTTP page that displays the current status of Kaospilot.
 * This is optional, but can be useful when hosting on IISNode in order to start
 * the plugin by visiting its URL or just to confirm that its up and running.
 * @type {integer/boolean} - The port number to use. Set to false if not available.
 */
var port = false;

exports.port = port;
exports.plugins = plugins;
exports.kalabalik = kalabalik;
exports.email = email;
exports.winstonTransport = winstonTransport;
exports.languages = languages;
exports.debug = debug;
