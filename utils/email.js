const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // We dont use GMAIL in production app/500mail per day/fast mark as spammer
    // Activate in gmail "less secure app" option
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'Martin Arsov <martinarsov@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
