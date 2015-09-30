// Kalabalik API URL and credentials.
var kalabalik = {
  url: '',
  username: '',
  password: '',
  port: 80
}

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

exports.kalabalik = kalabalik;
exports.email = email;
