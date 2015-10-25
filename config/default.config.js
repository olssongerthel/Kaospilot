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
 * plugins to be able to use localization (kaospilot.t) properly.
 * @type {Array}  languages
 * @type {String} languages[] - A valid language code (i.e. 'sv' or 'dk').
 */
var languages = [
  // 'sv',
  // 'en',
  // 'dk'
];

exports.kalabalik = kalabalik;
exports.email = email;
exports.winstonTransport = winstonTransport;
exports.languages = languages;
