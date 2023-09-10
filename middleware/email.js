import nodemailer from "nodemailer";
const sendMail = async (email, subject, htmlStyle,htmlbody) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "raglothbrokking@gmail.com",
        pass: "xweqwevzihptiahr",
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
        console.log("Email has been sent");
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default sendMail;
