const nodemailer = require('nodemailer')

const sandboxMail = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_SANDBOX_USER,
    pass: process.env.MAILTRAP_SANDBOX_PASSWORD
  }
});

const domainMail = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_LIVE_USER,
    pass: process.env.MAILTRAP_LIVE_PASSWORD
  }
});

const transporters = {
  sandboxMail,
  domainMail
}


module.exports = transporters