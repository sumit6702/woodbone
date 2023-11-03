import USERREGISTERMODEL from "../model/UserAccount.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
const uuid = uuidv4();
import ip from "ip";
import axios from "axios";
import LOGINATTEMPT from "../model/Loginattempt.js";
import NodeCache from "node-cache";
const otpCache = new NodeCache();
import nodemailer from "nodemailer";
import USERTOKEN from "../model/userTokenSchma.js";
import useragent from "useragent";
import sendMail from "../middleware/email.js";

function generateOTP() {
  const otpLength = 6;
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString().substr(0, otpLength);
}

const logincontroller = async (req, res) => {
  res.render("login", {
    userid: req.user,
    cartval: req.cartval,
    siteInfo: req.siteInfo,
  });
};

const userloginController = async (req, res) => {
  try {
    const usermail = req.body.loginmail;
    const userpassword = req.body.loginpsw;
    const data = await USERREGISTERMODEL.findOne({ email: usermail });
    const clientIP = ip.address();
    const failedLoginAttempts = {};
    //Blocked IP
    if (failedLoginAttempts[clientIP] >= 5) {
      console.log(`Blocked IP: ${clientIP}`);
      return res
        .status(429)
        .send("Too many failed login attempts. Please try again later.");
    }

    if (data) {
      if (await bcrypt.compare(userpassword, data.password)) {
        if (data.isVerified) {
          //If EveryThing is True
          req.session.user_id = data._id;
          failedLoginAttempts[clientIP] = 0;
          if (req.session.redirectPage) {
            const redirectUrl = req.session.redirectPage;
            delete req.session.redirectPage;
            return res.redirect(redirectUrl);
          } else {
            res.status(200).redirect("/");
          }
        } else {
          req.flash("useralert", [
            "Login failed!",
            "Please Verify Your Account!",
          ]);
          res.status(200).redirect("/login");
        }
      } else {
        req.flash("useralert", [
          "Login failed!",
          "Incorrect Email or Password.",
        ]);
        res.status(200).redirect("/login");
      }
    } else {
      failedLoginAttempts[clientIP] = (failedLoginAttempts[clientIP] || 0) + 1;
      req.flash("useralert", ["Login failed!", "Incorrect Email or Password."]);
      res.status(200).redirect("/login");
    }
  } catch (error) {
    console.log(error.message + "at UserLoginController");
  }
};

//adminLogin
const adminLoginController = async (req, res) => {
  try {
    var agent = useragent.parse(req.headers["user-agent"]);
    const userAgent = `${agent.os.family}/${agent.toAgent().split(" ")[0]}`;
    const website = req.siteInfo.siteName;
    const adminmail = req.body.adminmail;
    const adminpassword = req.body.adminpass;
    const adminData = await USERREGISTERMODEL.findOne({
      email: adminmail,
      role: "admin",
    });
    const clientIP = ip.address();
    const failedLoginAttempts = {};

    /* Block User */
    if (failedLoginAttempts[clientIP] >= 3) {
      console.log(`Blocked IP: ${clientIP}`);
      return res
        .status(429)
        .send("Too many failed login attempts. Please try again later.");
    }

    let result;
    /* User Validation */
    if (
      adminData &&
      (await bcrypt.compare(adminpassword, adminData.password))
    ) {
      failedLoginAttempts[clientIP] = 0;
      req.session.admin_id = adminData._id;
      res.redirect("/admin/dashboard");
      result = "success";
    } else {
      failedLoginAttempts[clientIP] = (failedLoginAttempts[clientIP] || 0) + 1;
      req.flash("adminalert", "Invalid email or password.");
      res.redirect("/admin/login");
      result = "failed";
    }

    /* Get IP Location */
    let ipCountry;
    getPublicIP()
      .then(async (publicIP) => {
        let Ips = publicIP;
        const abstapi = "fd72e7c80f3547b697a6dd0ac53e5412";
        try {
          const response = await axios.get(
            `https://ipgeolocation.abstractapi.com/v1/?api_key=${abstapi}&ip_address=${Ips}`
          );

          ipCountry = response.data.country;
        } catch (error) {
          console.error("Error retrieving IP geolocation:", error.message);
          ipCountry = "Unknown";
        }
        processLoginAttempt();
        await verifyMail(adminData.fullName, adminmail);
      })
      .catch((error) => {
        console.error("Failed to retrieve public IP:", error.message);
        ipCountry = "Unknown";
        processLoginAttempt();
      });

    async function processLoginAttempt() {
      const loginAttempt = new LOGINATTEMPT({
        email: adminmail,
        ipAddress: clientIP,
        country: ipCountry,
        result: result,
        userAgent: userAgent,
      });
      await loginAttempt.save();
    }
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/admin/login/reset_Password`;
    const verifyMail = async (username, email) => {
      const subject = `New Login Attempt`;
      const htmlStyle = `
      @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap');body{font-family: 'Ubuntu', sans-serif;margin:0;padding:0;background-color: #E1F2F8;}.container{background-color: #fff;padding: 12px;margin: 12px;box-shadow: 0px 0px 8px #eae9e985;border-radius: 12px;}h1,h2,h3,h4,h5,h6{line-height: 0;}#logindetails{border: 1px solid #dfdfdf51;padding: 8px;border-radius: 4px;background-color: #f0f0f02b;}#logindetails p {line-height: 8px;}.loginHead{font-weight: 500;}
      `;
      const htmlbody = `
      <div class="container">
      <div class="logo">
            <img width="58" src="${req.siteInfo.siteLogo}" alt="Logo">
        </div>
          <h5>Dear ${username},</h5>
          <p style="font-size: 14px;">We are writing to inform you about a recent login attempt on your ${website} account. Your security is our top priority, and we want to ensure that you are aware of this activity.</p>
          <div id="logindetails">
              <p>Login Details:</p>
              <p><span class="loginHead">Date and Time: </span> <span style="text-transform: uppercase;">${new Date().toLocaleString()}</span></p>
              <p><span class="loginHead">Location: </span>${ipCountry}</p>
              <p><span class="loginHead">Device/Browser: </span>${userAgent}</p>
              <p><span class="loginHead">Attempt:</span> <span style="color:rgb(188, 5, 81);font-weight: 500;">${result}</span></p>
          </div>
          <p><span style="color: rgb(0, 172, 195);">If this login attempt was made by you</span>, you can disregard this message. However, if you did not initiate this login, <span><a  style="color: rgb(188, 5, 81);" href="${resetUrl}">please change Your Password.</a></span></p>
          <p style="font-size: 10px; color: #9e9e9e;">Thank you for choosing ${website} for your online services. We are committed to safeguarding your account and personal information.</p>
          <div class="footer">
              <p style="font-size: 12px; text-align: center; color: #434343;">© ${new Date().getFullYear()} ${website}. All rights reserved.</p>
          </div>
      </div>
      `;
      await sendMail(email, subject, htmlStyle, htmlbody);
    };
  } catch (error) {
    console.log(error);
  }
};

//adminPasswordReset
const resetAdminController = async (req, res) => {
  res.status(200).render("adminPassReset",{siteInfo: req.siteInfo,});
};

//adminPasswordReset
const resetAdminPassController = async (req, res) => {
  try {
    const mail = req.body.resetmail;
    const admindata = await USERREGISTERMODEL.findOne({
      email: mail,
      role: "admin",
    });

    if (mail === admindata.email) {
      const otp = generateOTP();
      otpCache.set(admindata.email, otp, 60 * 1);
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/admin/login/reset_Password`;
      const verifyMail = async (req, res, name, email, otp) => {
        const subject = `Password Reset- Admin Panel`;
        const htmlStyle = `
        @import "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap";body{font-family:'Ubuntu',sans-serif;margin:0;padding:0;background-color:#E1F2F8}.container{background-color:#fff;padding:12px;margin:12px;box-shadow:0 0 8px #eae9e985;border-radius:12px}h1,h2,h3,h4,h5,h6{line-height:0}#otp span{width:fit-content;padding:5px 12px;border:1px solid #9b9b9b;border-radius:4px;background-color:#f0f0f06e}
      `;
        const htmlbody = `
      <div class="container">
        <div class="logo">
            <img width="58" src="${req.siteInfo.siteLogo}" alt="Logo">
        </div>
        <div class="content">
            <p>Dear ${name}</p>
            <p>To reset your password for your ${
              req.siteInfo.siteName
            } account, we have generated a One-Time Password (OTP) for you. This OTP is valid for 30 minutes and should be used exclusively for this password reset process.</p>
            <p id="otp">
                Your OTP: <span>${otp}</span>
            </p>
            <p style="font-size: 13px;">If you did not request this password reset, Ignore this message.</p>
            <p style="font-size: 13px; color: #91023b;">We recommend that you do not share this OTP with anyone and ensure that you reset your password securely.
            </p>
            <p style="font-size: 12px; color: #5f5f5f;">Thank you for using ${
              req.siteInfo.siteName
            }. We are dedicated to safeguarding your account and your data.</p>
        </div>
        <div class="footer">
              <p style="font-size: 12px; text-align: center; color: #434343;">© ${new Date().getFullYear()} ${
          req.siteInfo.siteName
        }. All rights reserved.</p>
          </div>
    </div>
      `;
        await sendMail(email, subject, htmlStyle, htmlbody);
      };
      const mailedd = await verifyMail(
        req,
        res,
        admindata.fullName,
        admindata.email,
        otp
      );
      if (mailedd) {
        console.log("Email Send!");
      }
    } else {
      req.flash("adminalert", "Invalid email!");
      res.render("adminPassReset");
      console.log("Not Vaild Email!");
    }
  } catch (error) {
    console.log("ResetPassword Error: " + error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
};

//adminVerifyOtp
const verifyotp = async (req, res) => {
  try {
    const userotp = req.body.resetotp;
    const mail = req.body.resetedmail;
    const storedOtp = otpCache.get(mail);
    if (userotp === storedOtp) {
      console.log("OTP is Matched!");
      res.redirect("/admin/login");
    } else {
      console.log("Incorrect OTP");
    }
  } catch (error) {
    console.log("OTP Verify Error: " + error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
};

//adminNewPassword
const newAdminPassword = async (req, res) => {
  try {
    const mail = req.body.resetedmailed;
    const pass = req.body.newadminpass;
    const Confpass = req.body.confnewadminpass;

    if (pass === Confpass) {
      const admindata = await USERREGISTERMODEL.findOne({
        email: mail,
        role: "admin",
      });
      if (admindata) {
        const hashpass = bcrypt.hashSync(pass, 10);
        admindata.password = hashpass;
        const updatedAdmin = await admindata.save();
        if (updatedAdmin) {
          res.redirect("/admin/login");
          console.log("password Updated");
        } else {
          console.log("password Not Updated");
        }
      } else {
        console.log("No Data found!");
      }
    } else {
      console.log("password Not Matching");
    }
  } catch (error) {
    console.log("New Admin Password Error: " + error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
};

async function getPublicIP() {
  try {
    const response = await axios.get("https://api.ipify.org?format=json", {
      timeout: 15000,
    });
    const { ip } = response.data;
    return ip;
  } catch (error) {
    console.error("Failed to retrieve public IP:", error.message);
    return null;
  }
}

const logoutController = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

export {
  logincontroller,
  userloginController,
  adminLoginController,
  logoutController,
  resetAdminController,
  resetAdminPassController,
  verifyotp,
  newAdminPassword,
};
