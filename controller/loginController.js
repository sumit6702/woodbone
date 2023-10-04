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

const logincontroller = async (req, res) => {
  res.render("login", { userid: req.user, cartval:req.cartval,siteInfo:req.siteInfo });
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
      return res.status(429).send("Too many failed login attempts. Please try again later.");
    }

    if (data) {
      if (await bcrypt.compare(userpassword, data.password)) {
        if(data.isVerified){
          //If EveryThing is True
        req.session.user_id = data._id;
        failedLoginAttempts[clientIP] = 0;
        if(req.session.redirectPage){
          const redirectUrl = req.session.redirectPage;
          delete req.session.redirectPage;
          return res.redirect(redirectUrl);
        }else{
          res.status(200).redirect("/");
        }
        }else{
        req.flash("useralert", ["Login failed!", "Please Verify Your Account!"]);
        res.status(200).redirect("/login");
        }
      } else {
        req.flash("useralert", ["Login failed!", "Incorrect Email or Password."]);
        res.status(200).redirect("/login");
      }
    } else {
      failedLoginAttempts[clientIP] = (failedLoginAttempts[clientIP] || 0) + 1;
      req.flash("useralert", ["Login failed!", "Incorrect Email or Password."]);
      res.status(200).redirect("/login");
    }

  } catch (error) {
    console.log(error.message+ "at UserLoginController");
  }
};

const adminLoginController = async (req, res) => {
  try {
    const adminmail = req.body.adminmail;
    const adminpassword = req.body.adminpass;
    const adminData = await USERREGISTERMODEL.findOne({email: adminmail, role:"admin"});
    const clientIP = ip.address();
    const failedLoginAttempts = {};

    if (failedLoginAttempts[clientIP] >= 3) {
      console.log(`Blocked IP: ${clientIP}`);
      return res
        .status(429)
        .send("Too many failed login attempts. Please try again later.");
    }

    let result;
    if ( adminData &&
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

    let ipCountry;
    getPublicIP().then(async (publicIP) => {
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
      }).catch((error) => {
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
      });
      await loginAttempt.save();
    }
  } catch (error) {
    console.log(error.message + "at AdminLoginController");
  }
};

const resetAdminController = async(req,res)=>{
  res.status(200).render('adminPassReset');
}

function generateOTP() {
  const otpLength = 6;
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString().substr(0, otpLength);
}

const verifyMail = async (name, email, otp) => {
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
    const mailInfo = {
      from: '"Woodbone" <woodbone@mail.com>',
      to: email,
      subject: `Admin Reset Password - Woodbone`,
      text: "<p>Admin Reset Password</p>",
      html: 
      `
      <!DOCTYPE html>
      <html>
      
      <head>
        <style>
          /* Your CSS styles here */
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
                You have requested to reset your admin password for <span style="font-weight: 600;">Woodbone Admin Panel</span>. 
                <br> 
                Your OTP for password reset is:
              </p>
              <p style="font-weight: bold;font-size: 32px; border: 1px solid #e3e3e39a; width: fit-content; padding: 4px 12px; box-shadow: inset 0px 0px 8px #94949476;">${otp}</p>
              <p style="margin: 42px 0;">If you did not request a password reset, please ignore this email.</p>
            </div>
          <div class="footer">
            <p>© 2023 Woodbone. All rights reserved.</p>
          </div>
        </div>
      </body>
      
      </html>
      `,
    };

    transpoter.sendMail(mailInfo, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send" + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resetAdminPassController = async(req,res)=>{
  try {
    const mail = req.body.resetmail;
    console.log(mail)
    const admindata = await USERREGISTERMODEL.findOne({email: mail, role:"admin"});

    if(mail === admindata.email){
      console.log("Submited");
      const otp = generateOTP();
      otpCache.set(admindata.email, otp, 60 * 1);
      const mailedd = await verifyMail(admindata.fullName, admindata.email, otp);
      if(mailedd){
        console.log("Email Send!")
      }
    }else{
      req.flash("adminalert", "Invalid email!");
      res.render("adminPassReset");
      console.log("Not Vaild Email!")
    }
    
    
  } catch (error) {
    console.log("ResetPassword Error: "+ error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
}


const verifyotp = async(req,res)=>{
  try {
    const userotp = req.body.resetotp;
    const mail = req.body.resetedmail;
    const storedOtp = otpCache.get(mail);
      if(userotp === storedOtp){
      console.log("OTP is Matched!")
      res.redirect('/admin/login');
      }else{
        console.log("Incorrect OTP")
      }
  } catch (error) {
    console.log("OTP Verify Error: "+ error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
}

const newAdminPassword = async(req,res)=>{
  try {
    const mail = req.body.resetedmailed;
    const pass = req.body.newadminpass;
    const Confpass = req.body.confnewadminpass;

    if(pass === Confpass){
      const admindata = await USERREGISTERMODEL.findOne({ email: mail, role:"admin" });
      if(admindata){
        const hashpass = bcrypt.hashSync(pass, 10);
        admindata.password = hashpass;
        const updatedAdmin = await admindata.save();
        if(updatedAdmin){
          res.redirect("/admin/login");
          console.log("password Updated");
        }else{
          console.log("password Not Updated");
        }
      }else{
        console.log("No Data found!");
      }
    }else{
      console.log("password Not Matching");
    }
    
  } catch (error) {
    console.log("New Admin Password Error: "+ error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
}

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

const logoutController = async(req, res) => {
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
