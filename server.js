const net = require("net");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Temporary SMTP connection test
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready");
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Orion Legacy Group Website" <${process.env.EMAIL_USER}>`,

      replyTo: email,

      to: "info@orionlegacygroup.org",

      subject: `New Website Inquiry - ${service || "General Inquiry"}`,

      text: `
        Name: ${name}

        Email: ${email}

        Phone: ${phone || "Not provided"}

        Service:
        ${service || "Not specified"}

        Message:
        ${message}
      `,
    });

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email sending failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send email",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/smtp-test", (req, res) => {
  const socket = new net.Socket();

  socket.setTimeout(10000);

  socket.connect(465, "gator4095.hostgator.com", () => {
    console.log("SMTP TCP connection successful");

    socket.destroy();

    res.json({
      success: true,
      message: "Render can connect to gator4095.hostgator.com on port 465",
    });
  });

  socket.on("timeout", () => {
    console.error("SMTP TCP connection timed out");

    socket.destroy();

    res.status(500).json({
      success: false,
      message: "SMTP TCP connection timed out",
    });
  });

  socket.on("error", (error) => {
    console.error("SMTP TCP connection failed:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  });
});

app.get("/api/public-ip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();

    console.log("Render public IP:", data.ip);

    res.json({
      success: true,
      ip: data.ip,
    });
  } catch (error) {
    console.error("Unable to determine public IP:", error);

    res.status(500).json({
      success: false,
      message: "Unable to determine public IP",
    });
  }
});
