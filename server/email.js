const nodemailer = require('nodemailer');

// Configure nodemailer for SMTP (can use Gmail, Outlook, ProtonMail, etc.)
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com', // Replace with your SMTP host
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your_email@example.com', // Replace with your email
    pass: 'your_email_password' // Replace with your email password or app password
  }
});

module.exports = transporter;
