const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000; // You can change this port as per your requirement

// Middleware to parse JSON bodies
app.use(express.json());

// Function to write audit record to file
function writeAuditRecord(auditRecord) {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const logFolderPath = path.join(__dirname, 'log');
  if (!fs.existsSync(logFolderPath)) {
    fs.mkdirSync(logFolderPath);
  }
  const logFilePath = path.join(logFolderPath, `${today}_audit.json`);

  // Append audit record to log file
  fs.appendFileSync(logFilePath, JSON.stringify(auditRecord) + '\n');
}

// Route to handle incoming POST requests
app.post('/sendEmail', (req, res) => {
  const {
    vTitle,
    vBody,
    vTo,
    CommunicationsName,
    TemplateName,
    vRecepient,
    vSubject,
    vParameters
  } = req.body;

  // Check if required fields are present
  if (!vTitle || !vBody || !vTo || !CommunicationsName || !TemplateName || !vRecepient || !vSubject || !vParameters) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }

  // Read email credentials from environment variables
  const username = process.env.vUser;
  const password = process.env.vPW;

  if (!username || !password) {
    return res.status(500).json({
      error: 'Email credentials not provided'
    });
  }

  // Read default template from default.json file
  const defaultTemplatePath = path.join(__dirname, 'template', 'default.json');
  const defaultTemplate = JSON.parse(fs.readFileSync(defaultTemplatePath, 'utf8'));

  // Generate sessionId as MD5 hash of current epoch time
  const sessionId = crypto.createHash('md5').update(Date.now().toString()).digest('hex');

  // Create a transporter with Gmail SMTP settings
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Gmail SMTP server host
    port: 587, // Gmail SMTP server port
    secure: false, // true for 465, false for other ports
    auth: {
      user: username, // Your Gmail address
      pass: password, // Your Gmail password
    },
  });

  // Compose email subject
  const emailSubject = defaultTemplate.tSubject + vSubject;

  // Compose email body by replacing variables
  let emailBody = defaultTemplate.tBody;
  emailBody = emailBody.replace('$tMsgTitle', vParameters.find(param => param.name === 'vMsgTitle').value);
  emailBody = emailBody.replace('$tMsgBody', vParameters.find(param => param.name === 'vMsgBody').value);

  // Define email options
  const mailOptions = {
    from: username,
    to: vTo,
    subject: emailSubject,
    html: emailBody,
    headers: {
      'x-header': {
        CommunicationsName: CommunicationsName,
        TemplateName: TemplateName,
        sessionId: sessionId
      }
    }
  };

  // Send email
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: 'Failed to send email'
      });
    } else {
      console.log('Email sent successfully');
      
      // Create audit record
      const auditRecord = {
        dateTime: Date.now(),
        ipAddress: req.ip,
        sessionId: sessionId,
        team: 'ALL',
        CommunicationsName: CommunicationsName,
        inputRequest: req.body,
        status: "EMAIL SENT",
        aSubject: emailSubject,
        aBody: emailBody,
        aTo: vTo,
        aCC: '', // You can adjust this based on your requirements
        aTemplate: TemplateName
      };

      // Write audit record to file
      writeAuditRecord(auditRecord);

      return res.status(200).json({
        message: 'Email sent successfully'
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
