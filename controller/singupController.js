import USERREGISTERMODEL from "../model/UserAccount.js";
import bcrypt from "bcryptjs";
import e from "express";
import nodemailer from "nodemailer";
import USERDATA from "../model/UserDataSchema.js";
const singupcontroller = async (req, res) => {
  try {
    res
      .status(200)
      .render("singup", { userid: req.user, cartval: req.cartval,siteInfo:req.siteInfo });
  } catch (error) {
    console.log(error.message + "at SingupController");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//email Verification!
const verifyMail = async (req, res, name, email, id) => {
  try {
    const transpoter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "raglothbrokking@gmail.com",
        pass: "xweqwevzihptiahr",
      },
    });

    const mailinfo = {
      from: '"Woodbone" <woodbone@mail.com>',
      to: email,
      subject: `Hello ${name}, Verification Mail.....`,
      text: "<p>Woodbone Verification</p>",
      html: `
      <!DOCTYPE html>
      <html>
      
      <head>
        <style>
      body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0}.container{padding:20px}.logo{padding:20px;padding-bottom:0}.logo h1{font-family:cursive;font-weight:800}.content{padding:20px;padding-top:0}.verification-link{margin-top:40px}.verification-link a{background-color:#000;padding:12px 22px;text-decoration:none;text-transform:uppercase;color:#fff;box-shadow:2px 2px 2px #00000048}.footer{margin-top:20px;font-size:12px;color:#999;padding:20px;}
        </style>
      </head>
      
      <body>
        <div class="container">
          <div class="logo">
            <!-- <img src="logo.png" alt="Logo"> -->
            <h1>LOGO</h1>
          </div>
          <div class="content">
            <h2>Hello, ${name}!</h2>
            <p>
              Thank you for registering with <span style="font-weight: 600;">Woodbone</span>. 
              <br> 
              before being able to use your account you need to verify that this is your email address by, Clicking below:
            </p>
            <p class="verification-link"><a href="${req.protocol}://${req.get(
        "host"
      )}/singup/verify?id=${id}" target='_self'>Verify Now</a></p>
            <p style="margin: 42px 0;">Thanks! – The <span style="font-weight: 600;">Woodbone</span> team</p>
          </div>
          <div class="footer">
            <p>© 2023 Woodbone. All rights reserved.</p>
          </div>
        </div>
      </body>
      
      </html>
      `,
    };

    transpoter.sendMail(mailinfo, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send" + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const newsingupController = async (req, res) => {
  try {
    const name = req.body.singupname;
    const mail = req.body.singupmail;
    const psw = bcrypt.hashSync(req.body.singuppsw, 10);
    const data = await USERREGISTERMODEL.findOne({ email: mail });
    const nameArray = name.split(" ");
    const firstName = nameArray.shift();
    const lastName = nameArray.join(" ");
    const newuser = new USERREGISTERMODEL({
      fullName: name,
      firstName: firstName,
      lastName: lastName,
      email: mail,
      password: psw,
      profileImg:{
        filename:"",
        path:""
      }
    });

    if (data) {
      req.flash("singuperror", "User Already Exist");
      res.redirect("/singup");
    } else {
      const user = await newuser.save();
      if (user) {
        const mailedd = await verifyMail(
          req,
          res,
          user.firstName,
          user.email,
          user._id
        );
      }
      res.send(
        "<p>Check Mail to Verify! <a href ='http://localhost:3080/login'>Login</a></p>"
      );
      req.flash("success", "Registration Successful");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//email verified!
const verifiedmailcontroller = async (req, res) => {
  try {
    const userdata = await USERREGISTERMODEL.findByIdAndUpdate(req.query.id, {
      $set: { isVerified: true },
    });
    const userDataCReation = new USERDATA({
      user: req.query.id,
    });
    await userDataCReation.save();
    if (userdata) {
      res.send(
        "You are verified click here to <a href ='http://localhost:3080/login'>Login</a>"
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { singupcontroller, newsingupController, verifiedmailcontroller };
