import CONTACTQURIES from "../model/contactSchema.js";
import PRODUCTS from "../model/productSchema.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

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
    await newQuery.save();
    req.flash("contactAlert", "Message Successfully Sent!");
    res.redirect("/contactus");
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
