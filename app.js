const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3000; // You can change this port as per your requirement

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle incoming POST requests
app.post('/sendEmail', (req, res) => {
  const { vTitle, vBody, vTo, CommunicationsName, TemplateName, vRecepient, vSubject, vParameters} = req.body;

  // Generate sessionId as SHA256 hash of current epoch time
  const sessionId = crypto.createHash('sha256').update(Date.now().toString()).digest('hex');
  console.log('Session ID:', sessionId);

  // Check if required fields are present
  if (!vTitle || !vBody || !vTo || !CommunicationsName || !TemplateName || !vRecepient || !vSubject || !vParameters || !Array.isArray(vParameters)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Extract vMsgTitle and vMsgBody from vParameters
  const vMsgTitle = vParameters.find(param => param.name === 'vMsgTitle')?.value;
  const vMsgBody = vParameters.find(param => param.name === 'vMsgBody')?.value;

  // Create a transporter with your SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Your SMTP server host
    port: 587, // Your SMTP server port
    secure: false, // false for TLS - as a boolean not string - if you don't use SSL
    auth: {
      user: process.env.vUser, // Your email address
      pass: process.env.vPW, // Your email password
    },
  });

  // Define email options
  const mailOptions = {
    from: 'rick.vosteen@gmail.com',
    to: vTo,
    subject: vTitle + ' - ' + req.ip + sessionId,
    text: vBody,
  };


  // Send email
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    } else {
      console.log('Email sent successfully');
      return res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to handle success and failure
function logMessage(success, res) {
  if (success) {
    return res.status(200).json({ message: 'Email sent successfully'});
    console.log('Email sent successfully');
  } else {
    return res.status(500).json({ error: 'Failed to send email' });
    console.error('Failed to send email:', success);
  }
}
