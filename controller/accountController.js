import USERREGISTERMODEL from "../model/UserAccount.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { secretkey } from "../config/session.js";
const secretKey = "woodbone201300";
const tokenExpiration = "30m";
import { Secret_Key, Publishable_Key } from "../config/payment.js";
import Stripe from "stripe";
import USERADDRESS from "../model/UserAddress.js";
import USERDATA from "../model/UserDataSchema.js";
import PRODUCTS from "../model/productSchema.js";
import { v4 as uuidv4 } from "uuid";
import { all } from "axios";
import ORDERS from "../model/orderSchema.js";
import easyinvoice from "easyinvoice";
import INVOICE from "../model/InvoiceSchema.js";
import fs from "fs";
import path from "path";
import sendMail from "../middleware/email.js";
import SITEINFO from "../model/siteInfoSchmea.js";
import 'dotenv/config'

const stripe = Stripe(Secret_Key);
let paymentSuccessful = false;
const endpointSecret =
  "whsec_9b386253ef51b34efa1411140798a8af886c03a5d10dafcc93ed97b40938f230";


const forgetPass = async (req, res) => {
  res.render("forgetPass", {
    userid: req.user,
    cartval: req.cartval,
    isUserFound: false,
    siteInfo: req.siteInfo,
  });
};

//Email Reset Link
const verifyMail = async (username, email, user) => {
  try {
    const token = jwt.sign({ user }, secretKey, {
      expiresIn: tokenExpiration,
    });
    const subject = `Hello ${username}, Password Reset`;
    const htmlStyle = `body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0}.container{padding:20px}.logo{padding:20px;padding-bottom:0}.logo h1{font-family:cursive;font-weight:800}.content{padding:20px;padding-top:0}.verification-link{margin-top:40px}.verification-link a{background-color:#000;padding:12px 22px;text-decoration:none;text-transform:uppercase;color:#fff;box-shadow:2px 2px 2px #00000048}.footer{margin-top:20px;font-size:12px;color:#999;padding:20px;} `;
    const htmlbody = `<div class="container">
    <div class="logo">
      <!-- <img src="logo.png" alt="Logo"> -->
      <h1>LOGO</h1>
    </div>
    <div class="content">
      <h1>Password Reset</h1>
      <h2>Hello, ${username}!</h2>
      <p>
        We have received a request to reset your password. Click the button below to set a new password:
      </p>
      <p class="verification-link"><a href="http://localhost:3080/account/new_password?id=${user}&token=${token}" target='_self'>Reset Password</a></p>
      <p style="font-size: 14px; color: #999;">This link is vaild for <span style="font-weight: 700;">30Min</span></p>
      <p>If you didn't request this, you can ignore this email. Your password will not be changed unless you click the link above.</p>
    </div>
    <div class="footer">
      <p>© 2023 Woodbone. All rights reserved.</p>
    </div>
    </div>`;
    await sendMail(email, subject, htmlStyle, htmlbody);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//Reset Mail Page
const PasswordUpdate = async (req, res) => {
  try {
    const mail = req.body.forgetpassMail;
    const user = await USERREGISTERMODEL.findOne({ email: mail });
    const usermail = user.email;
    const domain = usermail.match(/@(.+)/)[1];
    if (mail === usermail) {
      await verifyMail(user.firstName, user.email, user._id);
      res.render("forgetPass", {
        userid: req.user,
        cartval: req.cartval,
        isUserFound: true,
        mail: mail,
        domain: domain,
      });
      console.log("sccuess");
    } else {
      req.flash("mailAlert", "Email is not found!");
      res.redirect("/account/reset-password");
      console.log("failed");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//New Password Page
const PasswordUpdated = async (req, res) => {
  try {
    const { id, token } = req.query;
    const isResend = !!req.query.resend;
    res.render("resetedPassword", {
      userid: req.user,
      cartval: req.cartval,
      token: token,
      siteInfo: req.siteInfo,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
//Update Request
const resetPassUpdated = async (req, res) => {
  try {
    const pass = req.body.confnewpassword;
    const psw = bcrypt.hashSync(pass, 10);

    const updated = await USERREGISTERMODEL.findByIdAndUpdate(req.query.id, {
      password: psw,
    });
    if (updated) {
      res.redirect("/login");
      console.log("Password Reset");
    } else {
      res.redirect("/account/reset-password");
      console.log("Password not Reset");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const useraccount = async (req, res) => {
  try {
    const userAdd = await USERADDRESS.findOne({ userid: req.session.user_id });
    const data = await USERDATA.findOne({ user: req.session.user_id });
    const orders = await ORDERS.find({ user: req.session.user_id });
    let alladress;
    let products = [];
    let wishproducts;
    if (data) {
      let prodcutIds = [];
      orders.forEach((order) => {
        const orderProductIds = order.products.map(
          (product) => product.product_id
        );
        prodcutIds.push(orderProductIds);
      });

      //Ordered Products
      for (const Id of prodcutIds) {
        const orderProducts = await Promise.all(
          Id.map(async (mId) => {
            return await PRODUCTS.findById(mId);
          })
        );
        products.push(orderProducts);
      }
      //Whislist
      const wishlistItemIds = data.wishlist;
      wishproducts = await PRODUCTS.find({
        productId: { $in: wishlistItemIds },
      });
    } else {
      organizedProducts = null;
      wishproducts = null;
    }

    if (!userAdd) {
      alladress = null;
    } else {
      alladress = userAdd.address;
    }
    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "short", day: "2-digit" };
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString("en-US", options);

      const [month, day, year] = formattedDate.split(" ");
      const monthAbbreviation = month.slice(0, 3);

      return `${day}${monthAbbreviation}-${year}`;
    };

    const invoices = [];
    for (const order of orders) {
      const invoice = await INVOICE.findOne({ order_id: order.id });
      invoices.push(invoice);
    }

    res.render("useraccount.ejs", {
      userid: req.user,
      cartval: req.cartval,
      adress: alladress,
      orders,
      formatDate,
      products,
      wishproducts,
      userdata: data,
      invoices,
      siteInfo: req.siteInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const newAddress = async (req, res) => {
  try {
    const user = await USERREGISTERMODEL.findOne({ _id: req.session.user_id });
    const existAdd = await USERADDRESS.findOne({ userid: req.session.user_id });

    if (!existAdd) {
      const newAddress = new USERADDRESS({
        userid: user.id,
        address: {
          fullname: req.body.addFname,
          PhoneNo: req.body.addPno,
          Address: req.body.addAdd,
          State: req.body.addState,
          City: req.body.addCity,
          Pincode: req.body.addPinCode,
          Country: req.body.addCountry,
          default: false,
        },
      });
      await newAddress.save();
    } else {
      existAdd.address.push({
        fullname: req.body.addFname,
        PhoneNo: req.body.addPno,
        Address: req.body.addAdd,
        State: req.body.addState,
        City: req.body.addCity,
        Pincode: req.body.addPinCode,
        Country: req.body.addCountry,
        default: false,
      });
      await existAdd.save();
    }
    res.redirect("/my-account#userAddress");
  } catch (error) {}
};

const updatedefaultAddress = async (req, res) => {
  try {
    const addressId = req.body.addresscheckId;
    const userD = await USERADDRESS.findOne({ userid: req.session.user_id });
    const addressToUpdateIndex = userD.address.findIndex(
      (address) => address._id.toString() === addressId
    );
    if (addressToUpdateIndex !== -1) {
      userD.address.forEach((address, index) => {
        address.default = index === addressToUpdateIndex;
      });
    }
    await userD.save();
    res.redirect("/my-account#userAddress");
  } catch (error) {}
};

const updateAddress = async (req, res) => {
  const {
    adddressId,
    Addressfirstname,
    Addressphno,
    AddressAdd,
    AddressState,
    AddressCity,
    AddressPincode,
    AddressCountry,
  } = req.body;
  const UserAddress = await USERADDRESS.findOne({
    userid: req.session.user_id,
  });
  const updatedAddress = {
    fullname: Addressfirstname,
    PhoneNo: Addressphno,
    Address: AddressAdd,
    State: AddressState,
    City: AddressCity,
    Pincode: AddressPincode,
    Country: AddressCountry,
    default: true,
  };
  const UserCurrentAddress = UserAddress.address.findIndex(
    (address) => address._id.toString() === adddressId
  );

  if (UserCurrentAddress !== -1) {
    UserAddress.address[UserCurrentAddress] = updatedAddress;
    UserAddress.save();
    console.log("Address updated successfully");
  } else {
    console.log("Address not found");
  }
  res.redirect("/my-account#userAddress");
};

const deletAddress = async (req, res) => {
  try {
    const { deletadddressId } = req.body;
    const UserAddress = await USERADDRESS.findOne({
      userid: req.session.user_id,
    });
    const UserCurrentAddress = UserAddress.address.findIndex(
      (address) => address._id.toString() === deletadddressId
    );

    if (UserCurrentAddress !== -1) {
      UserAddress.address.splice(UserCurrentAddress, 1);
      await UserAddress.save();

      res.status(200).redirect("/my-account#userAddress");
    } else {
      res.status(404).json({ message: "Address not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const order = async (req, res) => {
  try {
    const orders = await ORDERS.find({ user: req.session.user_id });
    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "short", day: "2-digit" };
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString("en-US", options);

      const [month, day, year] = formattedDate.split(" ");
      const monthAbbreviation = month.slice(0, 3);

      return `${day}${monthAbbreviation}-${year}`;
    };

    const invoices = [];
    for (const order of orders) {
      const invoice = await INVOICE.findOne({ order_id: order.id });
      invoices.push(invoice);
    }

    //OrderIds
    let prodcutIds = [];
    orders.forEach((order) => {
      const orderProductIds = order.products.map(
        (product) => product.product_id
      );
      prodcutIds.push(orderProductIds);
    });

    //Ordered Products
    let products = [];
    for (const Id of prodcutIds) {
      const orderProducts = await Promise.all(
        Id.map(async (mId) => {
          return await PRODUCTS.findById(mId);
        })
      );
      products.push(orderProducts);
    }

    res.render("userorder.ejs", {
      userid: req.user,
      cartval: req.cartval,
      orders: orders,
      formatDate,
      products,
      invoices,
      siteInfo: req.siteInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await ORDERS.findById(orderId);
    if (order) {
      await ORDERS.findByIdAndUpdate(orderId, { Orderstatus: "cancellation initiated" });
      res.redirect("/orders");
    } else {
      res.redirect("/orders");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const updateOrder = async (req, res) => {
  try {
    const {orderid, orderStatus} = req.body;
    const order = await ORDERS.findOne({order_id:orderid});
    if (order) {
      await ORDERS.findByIdAndUpdate(order.id, { Orderstatus: orderStatus });
      res.redirect("/admin/orders");
    } else {
      res.redirect("/admin/orders");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const checkout = async (req, res) => {
  try {
    const address = await USERADDRESS.findOne({ userid: req.session.user_id });
    const data = await USERDATA.findOne({ user: req.session.user_id });

    const Cart = data.cart;

    let products, totalPricePerItem, quantity, defaultAdd, total;
    if (!Cart || Cart.length === 0 || Cart === null) {
      res.redirect("/cart");
      products = null;
      totalPricePerItem = null;
      quantity = null;
      defaultAdd = null;
      total = null;
    } else {
      if (!address) {
        res.redirect("/my-account#userAddress");
        req.flash("alert", "Please Add Address!");
        products = {};
        quantity = {};
        totalPricePerItem = {};
      } else {
        const productID = Cart.map((item) => item.productId);
        products = await PRODUCTS.find({ productId: { $in: productID } });
        quantity = Cart.map((quan) => quan.quantity);
        totalPricePerItem = products.map((item, index) => {
          const numericPrice = item.price;
          const itemQuantity = Cart[index].quantity;
          const totalPrice = numericPrice * itemQuantity;
          return totalPrice;
        });
        const addArray = address.address;
        addArray.forEach((addres) => {
          if (addres.default == true) {
            defaultAdd = addres;
          }
          return defaultAdd;
        });
        total = totalPricePerItem.reduce(
          (acc, product) => acc + parseInt(product, 0)
        );
      }
    }
    res.render("checkout.ejs", {
      userid: req.user,
      cartval: req.cartval,
      key: Publishable_Key,
      defaultAdd,
      products,
      total,
      quantity,
      totalPricePerItem,
      siteInfo: req.siteInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

/* ----------------------------- Stripe Payment ----------------------------- */







let NewOrder;
let invoice;
let Mproducts = [];

const payment = async (req, res) => {
  try {
    const siteInfo = await SITEINFO.findOne({}).sort({ timeStamp: -1 }).exec();
    const siteName = siteInfo.siteName;
    const siteLogo = siteInfo.siteLogo;
    const YOUR_DOMAIN = "http://localhost:3080";
    const total = req.body.totalPrice;
    const fullname = `${req.body.FirstName} ${req.body.LastName}`;
    const phoneno = req.body.PhoneNo;
    const Address = `${req.body.Address}, ${req.body.City}, ${req.body.State}, ${req.body.Pincode}, ${req.body.Country}`;
    const user = await USERREGISTERMODEL.findOne({ _id: req.session.user_id });
    const address = await USERADDRESS.findOne({ userid: req.session.user_id });
    const addArray = address.address;
    let defaultAdd;
    addArray.forEach((addres) => {
      if (addres.default == true) {
        defaultAdd = addres;
      }
      return defaultAdd;
    });
    const { prodcutname, product_id, prodcutprice, productquantity } = req.body;
    const isMultipleProducts = Array.isArray(prodcutname);

    let products = [];
    let invoiceProducts = [];

    if (isMultipleProducts) {
      products = prodcutname.map((name, index) => ({
        product_id: product_id[index],
        productname: name,
        ProductQuantity: productquantity[index],
        productPrices: prodcutprice[index],
      }));
      invoiceProducts = prodcutname.map((name, index) => ({
        quantity: productquantity[index],
        description: name,
        "tax-rate": 18,
        price: prodcutprice[index] / (1 + 0.18),
      }));
      Mproducts = prodcutname.map((name, index) => ({
        Name: name,
        Quantity: productquantity[index],
        Prices: prodcutprice[index],
      }));
    } else {
      products.push({
        product_id: product_id,
        productname: prodcutname,
        ProductQuantity: productquantity,
        productPrices: prodcutprice,
      });
      invoiceProducts.push({
        quantity: productquantity,
        description: prodcutname,
        "tax-rate": 18,
        price: prodcutprice / (1 + 0.18),
      });
      Mproducts.push({
        Name: prodcutname,
        Quantity: productquantity,
        Prices: prodcutprice,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: total * 100,
            product_data: {
              name: "Furniture Site",
              metadata: {
                address: Address,
                fullname: fullname,
                phoneNo: phoneno,
              },
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/order/succesful`,
      cancel_url: `${YOUR_DOMAIN}/order/failed`,
    });
    const suuid = uuidv4().slice(25, 36);
    const orderID = `WBPVT${suuid}`;

    NewOrder = new ORDERS({
      order_id: orderID,
      user: user._id,
      name: fullname,
      email: user.email,
      phoneno: phoneno,
      ShippingAddress: Address,
      BillingAddress: Address,
      orderprice: total,
      products: products,
      PaymentInformation: "Card",
    });

    const BillerDetail = {
      company: fullname,
      address: req.body.Address,
      zip: req.body.Pincode,
      city: req.body.City,
      country: req.body.Country,
    };

    const __dirname = path.resolve();
    const invoicePath = path.join(__dirname, "config", "invoicetemp.html");

    invoice = {
      customize: {
        template: fs.readFileSync(invoicePath, "base64"),
      },
      images: {
        // The logo on top of your invoice
        logo: "https://i.ibb.co/hXsmcBZ/Logo.png",
        // The invoice background
        background: "",
      },
      // Your own data
      sender: {
        company: siteName,
        address: "B-17, Aya Nagar Extension",
        zip: "110047",
        city: "New Delhi",
        country: "India",
      },
      // Your recipient
      client: BillerDetail,
      information: {
        // Invoice number
        number: uuidv4().slice(1, 8),
        date: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      },
      products: invoiceProducts,
      "bottom-notice": "Thank you for your order! - Woodbone",
      settings: {
        currency: "INR",
        // "locale": "nl-NL",
        // "margin-top": 25,
        // "margin-right": 25,
        // "margin-left": 25,
        // "margin-bottom": 25,
        // "format": "A4"
        // "height": "1000px",
        // "width": "500px",
        // "orientation": "landscape",
      },
      translate: {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": null, // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal", // Defaults to 'Total'
        vat: "GST", // Defaults to 'vat'
      },
    };

    paymentSuccessful = true;
    res.redirect(303, session.url);
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};


const paymentResponse = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const paymentS = async (req, res) => {
  if (paymentSuccessful) {
    const siteInfo = await SITEINFO.findOne({}).sort({ timeStamp: -1 }).exec();
    const siteName = siteInfo.siteName;
    const siteLogo = siteInfo.siteLogo;
    const data = await USERDATA.findOne({ user: req.session.user_id });
    const user = await USERREGISTERMODEL.findOne({ _id: req.session.user_id });
    const Cart = data.cart;
    const productID = Cart.map((item) => item.productId);
    const total = req.body.totalPrice;
    const address = await USERADDRESS.findOne({ userid: req.session.user_id });
    const addArray = address.address;

    let defaultAdd;
    addArray.forEach((addres) => {
      if (addres.default == true) {
        defaultAdd = addres;
      }
      return defaultAdd;
    });

    await USERDATA.updateOne({ user: req.user.id }, { $set: { cart: [] } });

    const UpdateOrder = await NewOrder.save();
    const order = {
      orderID: UpdateOrder.id,
    };

    await USERDATA.updateOne(
      { userid: req.user.id },
      { $push: { orders: order } },
      { $push: { cart: {} } }
    );

    const result = await easyinvoice.createInvoice(invoice);

    const orderInvoice = new INVOICE({
      order_id: UpdateOrder.id,
      invoice: result.pdf,
    });

    await orderInvoice.save();
    const InvoiceDate = new Date().toLocaleDateString("en-IN");
    const productTable = Mproducts.map(
      (product) => `
    <tr>
      <td>${product.Name}</td>
      <td>${product.Quantity}</td>
      <td>Rs.${product.Prices}</td>
    </tr>
  `
    ).join("");
    // Send Order Invoice to User
    const verifyMail = async (username, email, user) => {
      const subject = `Hello ${username}, Password Reset`;
      const htmlStyle = `body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;margin:0;padding:0}.container{padding:20px}.logo{padding:20px;padding-bottom:0}.logo h1{font-family:cursive;font-weight:800}.content{padding:20px;padding-top:0}table,th,td{border:1px solid rgba(191,191,191,.299);border-collapse:collapse;padding:2px 8px}tbody tr td{text-align:center}.footer{margin-top:20px;font-size:12px;color:#999;padding:20px}`;
      const htmlbody = `<div class="container">
      <div class="logo">
          <!-- <img src="logo.png" alt="Logo"> -->
          <h1>LOGO</h1>
      </div>
      <div class="content">
          <h4>Hello, ${username}!</h4>
          <h3>Thank you for Purchasing</h3>
          <div>
              Your orders:
              <table>
                  <thead>
                      <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                      </tr>
                  </thead>
                  <tbody>
                    ${productTable}
                  </tbody>
              </table>
          </div>
          <div>
              <p style="font-weight: 500;">Invoice:</p>
              <p>Invoice Number: ${orderInvoice.order_id}</p>
              <p>Invoice Date: ${InvoiceDate}</p>
          </div>
      </div>
      <div class="footer">
          <p>© 2023 ${siteName}. All rights reserved.</p>
      </div>
    </div>`;
      await sendMail(email, subject, htmlStyle, htmlbody);
    };
    await verifyMail(user.fullName, user.email, user._id);

    res.render("paymentP", {
      userid: req.user,
      cartval: req.cartval,
      siteInfo: req.siteInfo,
    });
  } else {
    res.redirect("/error");
  }
};

const paymentF = async (req, res) => {
  if (paymentSuccessful) {
    res.render("paymentF", {
      userid: req.user,
      cartval: req.cartval,
      siteInfo: req.siteInfo,
    });
  } else {
    res.redirect("/error");
  }
};

const updateUser = async (req, res) => {
  try {
    const user = USERREGISTERMODEL.findOne({ _id: req.session.user_id });
    if (user) {
      const { userfullname, usermail } = req.body;
      const trimmedUsermail = usermail.trim();
      const update = {
        fullName: userfullname,
        email: trimmedUsermail,
      };
      await USERREGISTERMODEL.updateOne({ _id: req.session.user_id }, update);
      res.redirect("/my-account");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const userPasswordUpdate = async (req, res) => {
  try {
    const user = await USERREGISTERMODEL.findOne({
      _id: req.session.user_id,
    }).exec();
    const { olduserPassword, newuserPassword, confuserPassword } = req.body;
    const IsPassword = await bcrypt.compare(olduserPassword, user.password);

    if (IsPassword && newuserPassword == confuserPassword) {
      const password = bcrypt.hashSync(confuserPassword, 10);
      const update = {
        password: password,
      };
      const UpdatedPassword = await USERREGISTERMODEL.findOneAndUpdate(
        { _id: req.session.user_id },
        update
      );
      if (UpdatedPassword) {
        res.redirect("/my-account");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const getInvoice = async (req, res) => {
  try {
    const invoice = await INVOICE.findById(req.params.id);
    if (!invoice) {
      return res.status(404).send("Invoice not found");
    }
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Woodbone_Invoice.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(invoice.invoice, "base64"));
  } catch (error) {
    console.log(error);
    res.status(400).send("Internal Server Error");
  }
};

const passwordChange = async (req, res) => {
  try {
    const oldPass = req.body.adminoldPass;
    const newPass = req.body.adminnewPass;
    const confPass = req.body.adminCongPass;
    const hashPass = bcrypt.hashSync(confPass, 10);
    const adminData = await USERREGISTERMODEL.findById(req.session.admin_id);
    console.log(adminData);

    if (!adminData) {
      req.flash("alert", "Admin Not Found!");
      res.redirect("/admin/profile");
    } else {
      const isPass = await bcrypt.compare(oldPass, adminData.password);
      if (isPass) {
        if (newPass === confPass) {
          await USERREGISTERMODEL.findByIdAndUpdate(req.session.admin_id, {
            password: hashPass,
          });
          req.flash("alert", "Password Updated");
          res.redirect("/admin/profile#adminsecurity");
        } else {
          req.flash("alert", "New Password not Matching");
          res.redirect("/admin/profile");
        }
      } else {
        req.flash("alert", "Incorrect Password");
        res.redirect("/admin/profile");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    //
    const { adminName, adminEmail, adminMobile } = req.body;
    const adminData = await USERREGISTERMODEL.findById(req.session.admin_id);
    if (!adminData) {
      req.flash("alert", "Admin Not Found!");
      res.redirect("/admin/profile");
    } else {
      await USERREGISTERMODEL.findByIdAndUpdate(req.session.admin_id, {
        fullName: adminName,
        email: adminEmail,
        mobile: adminMobile,
      });
      req.flash("alert", "Profile Updated");
      res.redirect("/admin/profile#adminprofile");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};

const profileUploader = async (req, res) => {
  try {
    const image = req.file;

    if (!image) {
      req.flash("alert", "No image uploaded");
      res.redirect("/admin/profile");
    } else {
      const adminData = await USERREGISTERMODEL.findById(
        req.session.user_id || req.session.admin_id
      );
      if (adminData && adminData.profileImg) {
        const oldImg = adminData.profileImg.path;
        if (fs.existsSync(oldImg)) {
          fs.unlinkSync(oldImg);
          console.log("File deleted successfully:", oldImg);
        }
      }

      if (!adminData) {
        req.flash("alert", "Admin Not Found!");
        res.redirect("/admin/profile");
      } else {
        await USERREGISTERMODEL.findByIdAndUpdate(
          req.session.user_id || req.session.admin_id,
          {
            profileImg: {
              filename: image.filename,
              path: image.path,
            },
          }
        );

        req.flash("alert", "Profile Updated");
        res.redirect("/admin/profile#adminprofile");
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};

const updateSiteInfo = async (req, res) => {
  try {
    const siteName = req.body.siteName;
    const siteLogo = req.file;

    const siteInfo = new SITEINFO({
      siteName: siteName,
      siteLogo: siteLogo.path,
    });
    const updated = await siteInfo.save();
    if (updated) {
      res.redirect("/admin/profile");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};


export {
  forgetPass,
  PasswordUpdate,
  PasswordUpdated,
  resetPassUpdated,
  useraccount,
  order,
  checkout,
  payment,
  paymentResponse,
  paymentS,
  paymentF,
  newAddress,
  updatedefaultAddress,
  updateAddress,
  deletAddress,
  updateUser,
  userPasswordUpdate,
  getInvoice,
  passwordChange,
  updateAdminProfile,
  profileUploader,
  updateSiteInfo,
  cancelOrder,
  updateOrder
};
