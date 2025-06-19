const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Define schema and model
const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: { type: Date, default: Date.now }
});

const Lead = mongoose.model('Lead', leadSchema);

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { name, email } = req.body;

  try {
    // Save to MongoDB
    await Lead.create({ name, email });

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'ProductX Signup Confirmation',
      text: `Hi ${name},\n\nThanks for signing up for ProductX! We'll keep you updated.\n\n– ProductX Team`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send('Lead saved and email sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving lead or sending email.');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
