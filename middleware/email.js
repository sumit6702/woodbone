import nodemailer from "nodemailer";
import "dotenv/config";
const coMail = process.env.CO_MAIL;
const coPass = process.env.CO_MAIL_PASS;
const sendMail = async (email, subject, htmlStyle,htmlbody) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      pool: true,
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: coMail,
        pass: coPass,
      },
    });

    const mailInfo = {
      from: '"Woodbone" <woodbone@mail.com>',
      to: email,
      subject: subject,
      html: `
      <!DOCTYPE html>
      <html>
      
      <head>
        <style>
        ${htmlStyle}
        </style>
      </head>
      
      <body>
        ${htmlbody}
      </body>
      </html>
          `,
    };

    transporter.sendMail(mailInfo, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Email Deliverd!');
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default sendMail;
