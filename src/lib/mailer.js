const nodemailer = require('nodemailer')

module.exports =  nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "becfef01aef93e",
    pass: "75d07698102441"
  }
});

