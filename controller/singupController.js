import USERREGISTERMODEL from "../model/UserAccount.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import USERDATA from "../model/UserDataSchema.js";
import sendMail from "../middleware/email.js";

const singupcontroller = async (req, res) => {
  try {
    res.status(200).render("singup", {
      userid: req.user,
      cartval: req.cartval,
      siteInfo: req.siteInfo,
    });
  } catch (error) {
    console.log(error.message + "at SingupController");
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
      profileImg: {
        filename: "",
        path: "",
      },
    });

    if (data) {
      req.flash("singuperror", "User Already Exist");
      res.redirect("/singup");
    } else {
      const user = await newuser.save();
      if (user) {
        const verifyMail = async (req, res, name, email, id) => {
          try {
            const subject = `Verify Your Email Address for ${req.siteInfo.siteName}`;
            const htmlStyle = `
            @import "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap";.logo{padding:20px;padding-bottom:0}.logo h1{font-family:cursive;font-weight:800}.content{padding:20px;padding-top:0}#verification-link{margin-top:40px}#verification-link a{text-decoration:none;color:#000;border:1px solid #000;padding:2px 6px;box-shadow:0 0 8px #e8e8e848;border-radius:3px}.footer{font-size:12px;color:#999}body{font-family:'Ubuntu',sans-serif;margin:0;padding:0;background-color:#E1F2F8}.container{background-color:#fff;padding:12px;margin:12px;box-shadow:0 0 8px #eae9e985;border-radius:12px}h1,h2,h3,h4,h5,h6{line-height:0}
            `;
            const htmlbody = `
            <div class="container">
            <div class="logo">
              <img width="58" src="${req.siteInfo.siteLogo}" alt="Logo">
            </div>
            <div class="content">
              <p>Dear ${name}</p>
              <p>
                Thank you for signing up for ${req.siteInfo.siteName}. To complete the registration process and access your account, please verify your email address by clicking the link below:
              </p>
              <p id="verification-link">
                <span>Verify Your Email Address:</span>
                <a href="${req.protocol}://${req.get("host")}/singup/verify?id=${id}" target='_self'>Verify Now</a>
            </p>
            <p style="margin-top: 42px;">If you have any questions or encounter any issues, please feel free to contact our support team at Customer Support Email or Phone Number. We're here to help.</p>
              <p style="font-size: 14px; color: #606060;">Thank you for choosing ${req.siteInfo.siteName}. We look forward to having you as part of our community.</p>
            </div>
            <div class="footer">
              <p style="text-align: center;">© ${new Date().getFullYear()} ${req.siteInfo.siteName}. All rights reserved.</p>
            </div>
        </div>
            `;
            await sendMail(email, subject, htmlStyle, htmlbody);
          } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
          }
        };
        const mailedd = await verifyMail(
          req,
          res,
          user.firstName,
          user.email,
          user._id
        );
      }
      res.redirect("/login");
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
        `You are verified click here to <a href ='${req.protocol}://${req.get(
          "host"
        )}/login'>Login</a>`
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { singupcontroller, newsingupController, verifiedmailcontroller };
