import CONTACTQURIES from "../model/contactSchema.js";
import PRODUCTS from "../model/productSchema.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import sendMail from "../middleware/email.js";
import USERREGISTERMODEL from "../model/UserAccount.js";

const indexcontroller = async (req, res) => {
  try {
    const haveproducts = await PRODUCTS.find({});
    let products;
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    shuffleArray(haveproducts);

    if (haveproducts) {
      products = haveproducts;
      products.forEach((product) => {
        const desc = JSON.parse(product.description);
        const converter = new QuillDeltaToHtmlConverter(desc.ops);
        product.htmldesc = converter.convert();
      });
    } else {
      products = null;
    }
    res.render("index", { userid: req.user, cartval:req.cartval, products, siteInfo:req.siteInfo });
  } catch (error) {
    console.log(error + " at indexController");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const contactcontroller = async (req, res) => {
  res.render("contactus", { userid: req.user, cartval:req.cartval,siteInfo:req.siteInfo });
};

const contactQueries = async (req, res) => {
  try {
    const usermessage = req.body.contact_Message;
    const username = req.body.contact_Name;
    const usermail = req.body.contact_Email;
    const newQuery = new CONTACTQURIES({
      message: usermessage,
      name: username,
      email: usermail,
    });
    const ContactQuery = await newQuery.save();
    const admin = await USERREGISTERMODEL.findOne({ role: "admin" });
    const adminmail = admin.email;
    const siteLogo = `http://localhost:3080/${req.siteInfo.siteLogo}`;
    if(ContactQuery){
      const verifyMail = async (username, email, usermessage, adminmail, siteLogo) => {
        const subject = `Hello Admin, Contact Inquiry`;
        const htmlStyle = `body{font-family:Verdana, Geneva, Tahoma, sans-serif;padding:0}.container{padding:20px}.logo{padding:20px;padding-bottom:0}.logo h1{font-family:cursive;font-weight:800}.content{padding:10px;padding-top:0; width: 80%;}table,th,td{border:1px solid rgba(191,191,191,.299);border-collapse:collapse;padding:2px 8px}tbody tr td{text-align:center}.footer{margin-top:20px;font-size:12px;color:#999;padding:20px}`;
        const htmlbody = `<div class="container">
        <div class="logo">
            <h1><img src="siteLogo"></h1>
            <h3>Contact Enquiry</h3>
        </div>
        <div class="content">
            <div style="border: 1px solid #f7f7f7; padding: 12px; border-radius: 14px; box-shadow: 0px 0px 12px #00000015;">
                <p>Name: <span style="font-weight: 500;color: #494949;">${username}</span></p>
                <p>Email: <span style="font-weight: 500;color: #494949;"><a href="mailto:${email}" style="text-decoration: none; color: rgba(0, 105, 112, 0.993);">${email}</a></span></p>
                <p>Message: 
                    <span style="font-weight: 500; margin-left: 8px;color: #494949;">
                        ${usermessage}
                    </span>
                </p>
            </div>
        </div>
        <div class="footer">
            <p>© 2023 Woodbone. All rights reserved.</p>
        </div>
    </div>`;
        await sendMail(adminmail, subject, htmlStyle, htmlbody);
      };
      await verifyMail(username, usermail, usermessage, adminmail, siteLogo);
      req.flash("contactAlert", "Message Successfully Sent!");
      res.redirect("/contactus");
    }else{
      req.flash("contactAlert", "There is Error!");
      res.redirect("/contactus");
    }
  } catch (error) {
    console.log(error.message + " at ContactController");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const pagetesterscontroller = async (req, res) => {
  res.render("ADloginactivity", { userid: req.user, cartval:req.cartval, title: "", products: "" });
};

const PagenotFound = async (req, res) => {
  try {
    res.status(404).render("404page", { userid: req.user, cartval:req.cartval,siteInfo:req.siteInfo });
  } catch (error) {
    console.log(error.message + " at PageNotController")
    res.status(500).send("Internal Server Error");
  }
};

export {
  indexcontroller,
  pagetesterscontroller,
  contactcontroller,
  contactQueries,
  PagenotFound,
};
