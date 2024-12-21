import "dotenv/config";
import USERREGISTERMODEL from "../model/UserAccount.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const secretKey = "woodbone201300";
const tokenExpiration = "30m";
import { Secret_Key, Publishable_Key } from "../config/payment.js";
import Stripe from "stripe";
import USERADDRESS from "../model/UserAddress.js";
import USERDATA from "../model/UserDataSchema.js";
import PRODUCTS from "../model/productSchema.js";
import { v4 as uuidv4 } from "uuid";
import ORDERS from "../model/orderSchema.js";
import easyinvoice from "easyinvoice";
import INVOICE from "../model/InvoiceSchema.js";
import sendMail from "../middleware/email.js";
import SITEINFO from "../model/siteInfoSchmea.js";
import { timeStamp } from "console";
const stripe = Stripe(Secret_Key);

import path from "path";
import fs from "fs-extra";
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const siteUploadDir = path.join(__dirname, "uploads");

const forgetPass = async (req, res) => {
  res.render("forgetPass", {
    userid: req.user,
    cartval: req.cartval,
    isUserFound: false,
    siteInfo: req.siteInfo,
  });
};

//Reset Mail Page
const PasswordUpdate = async (req, res) => {
  try {
    const mail = req.body.forgetpassMail;
    const user = await USERREGISTERMODEL.findOne({ email: mail });
    const usermail = user.email;
    const domain = usermail.match(/@(.+)/)[1];
    if (mail === usermail) {
      const verifyMail = async (req, res, username, email, user) => {
        try {
          const token = jwt.sign({ user }, secretKey, {
            expiresIn: tokenExpiration,
          });
          const subject = `Password Reset - ${req.siteInfo.siteName}`;
          const htmlStyle = `
          @import "https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap";.logo{padding:20px;padding-bottom:0}.logo h1{font-family:cursive;font-weight:800}.content{padding:20px;padding-top:0}#verification-link{display:block;margin-top:40px;margin-bottom:40px}#verification-link a{padding:6px 12px;text-decoration:none;border:1px solid #6c6c6cee;color:#000;border-radius:2px}.footer{font-size:12px;color:#999;padding:20px;text-align:center}body{font-family:'Ubuntu',sans-serif;margin:0;padding:0;background-color:#E1F2F8}.container{background-color:#fff;padding:12px;margin:12px;box-shadow:0 0 8px #eae9e985;border-radius:12px}h1,h2,h3,h4,h5,h6{line-height:0}#otp span{width:fit-content;padding:5px 12px;border:1px solid #9b9b9b;border-radius:4px;background-color:#f0f0f06e}
          `;
          const htmlbody = `
          <div class="container">
        <div class="logo">
            <img width="58" src="${req.siteInfo.siteLogo}" alt="Logo">
        </div>
        <div class="content">
            <p>Hello, ${username}!</p>
            <p style="line-height: 4px;"></p>
            <p>To reset your password for your ${
              req.siteInfo.siteName
            } account, we have generated a One-Time Password (link) for you.
                This (link) is valid for 30 minutes and should be used exclusively for this password reset process.</p>

            <div id="verification-link">
            <p><a href="${req.protocol}://${req.get(
            "host"
          )}/account/new_password?id=${user}&token=${token}" target='_self'>Reset Password</a>
            </p>
            <p style="font-size: 14px; color: #999;">This link is vaild for <span style="font-weight: 700;">30Min</span>
            </p>
            </div>

            <p style="font-size: 13px;">If you did not request this password reset, Ignore this message.</p>
            <p style="font-size: 12px; color: #5f5f5f;">Thank you for using ${
              req.siteInfo.siteName
            }. We are dedicated
                to safeguarding your account and your data.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${
            req.siteInfo.siteName
          }. All rights reserved.</p>
        </div>
    </div>
          `;
          await sendMail(email, subject, htmlStyle, htmlbody);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      };
      await verifyMail(req, res, user.firstName, user.email, user._id);
      res.render("forgetPass", {
        userid: req.user,
        cartval: req.cartval,
        isUserFound: true,
        mail: mail,
        domain: domain,
        siteInfo: req.siteInfo,
      });
    } else {
      req.flash("mailAlert", "Email is not found!");
      res.redirect("/account/reset-password");
    }
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    } else {
      res.redirect("/account/reset-password");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const useraccount = async (req, res) => {
  try {
    const userAdd = await USERADDRESS.findOne({ userid: req.session.user_id });
    const data = await USERDATA.findOne({ user: req.session.user_id });
    const orders = await ORDERS.find({ user: req.session.user_id });
    let alladress;
    let wishproducts;
    if (data) {
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

    res.render("useraccount.ejs", {
      userid: req.user,
      cartval: req.cartval,
      adress: alladress,
      orders,
      formatDate,
      wishproducts,
      userdata: data,
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
    const orders = (await ORDERS.find({ user: req.session.user_id })).reverse();
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
          return await PRODUCTS.findOne({ productId: mId });
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
      await ORDERS.findByIdAndUpdate(orderId, {
        Orderstatus: "cancellation initiated",
      });
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
    const { orderid, orderStatus } = req.body;
    const order = await ORDERS.findOne({ order_id: orderid });
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
const stripePay = async (req, res) => {
  try {
    if (req.query.allowed == req.session.user_id) {
      const userinfo = await USERREGISTERMODEL.findById(req.session.user_id);
      const address = await USERADDRESS.findOne({
        userid: req.session.user_id,
      });
      const data = await USERDATA.findOne({ user: req.session.user_id });
      const Cart = data.cart;

      if (!Cart || Cart.length === 0 || Cart === null) {
        res.redirect("/cart");
      } else {
        let products, totalPricePerItem, quantity, defaultAdd, total;
        defaultAdd = address.address.find((addr) => addr.default === true);
        defaultAdd = JSON.stringify(defaultAdd);

        const productID = Cart.map((item) => item.productId);
        products = await PRODUCTS.find({ productId: { $in: productID } });
        quantity = Cart.map((quan) => quan.quantity);

        totalPricePerItem = products.map((item, index) => {
          const numericPrice = item.price;
          const itemQuantity = Cart[index].quantity;
          const totalPrice = numericPrice * itemQuantity;
          return totalPrice;
        });

        total = totalPricePerItem.reduce(
          (acc, product) => acc + parseInt(product, 0)
        );

        res.render("paynow", {
          userid: req.user,
          userinfo: userinfo,
          cartval: req.cartval,
          siteInfo: req.siteInfo,
          products,
          totalPricePerItem,
          quantity,
          defaultAdd,
          total,
        });
      }
    } else {
      res.status(404).render("404page", {
        userid: req.user,
        cartval: req.cartval,
        siteInfo: req.siteInfo,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};

const stripePay_ = async (req, res) => {
  try {
    const { metadata } = req.body;
    const totalPriceInRupee = metadata.totalprice * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPriceInRupee,
      currency: "inr",
      receipt_email: metadata.useremail,
      metadata: metadata,
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};

const paymentSuccessfull = async (req, res) => {
  try {
    const meta = req.body;
    const rawProducts = JSON.parse(meta.userproducts);
    const total = meta.totalprice;
    const userDefaultAdd = JSON.parse(meta.userAddress);
    const userid = meta.userid;

    /* Generating Order Id */
    const suuid = uuidv4().slice(25, 36);
    const orderID = `WBPVT${suuid}`;
    /* Invoice File */
    const __dirname = path.resolve();
    const invoicePath = path.join(__dirname, "config", "invoicetemp.html");
    /* User Data */
    const user_ = await USERREGISTERMODEL.findOne({ _id: userid });
    const user_data = await USERDATA.findOne({ user: userid });
    const allProducts = await PRODUCTS.find({});
    const user_address = await USERADDRESS.findOne({
      userid: userid,
    });

    const fullname = userDefaultAdd.fullname;
    const phoneno = userDefaultAdd.PhoneNo || "";
    const Address = `${userDefaultAdd.Address}, ${userDefaultAdd.City}, ${userDefaultAdd.State}, ${userDefaultAdd.Pincode}, ${userDefaultAdd.Country}`;

    const products = [];
    for (let i = 0; i < rawProducts.length; i++) {
      const element = rawProducts[i];
      products.push({
        product_id: element.productId,
        productname: element.productName,
        ProductQuantity: Number(element.productQuantity),
        productPrices: Number(element.productPrice),
      });
    }

    /* Generating New Order */
    const NewOrder = new ORDERS({
      order_id: orderID,
      user: user_._id,
      name: fullname,
      email: user_.email,
      phoneno: Number(phoneno),
      ShippingAddress: Address,
      BillingAddress: Address,
      orderprice: Number(total),
      products: products,
      PaymentInformation: "Card",
    });

    /* Invoice Generating */
    const BillerDetail = {
      company: fullname,
      address: userDefaultAdd.Address,
      zip: Number(userDefaultAdd.Pincode),
      city: userDefaultAdd.City,
      country: userDefaultAdd.Country,
    };

    const invoiceProducts = [];
    for (let i = 0; i < rawProducts.length; i++) {
      const product = rawProducts[i];
      invoiceProducts.push({
        quantity: Number(product.productQuantity),
        description: product.productName,
        "tax-rate": 18,
        price: Number(product.productPrice) / (1 + 0.18),
      });
    }

    const siteData = req.siteInfo;
    const siteLogo =
      siteData.siteLogo !== ""
        ? siteData.siteLogo
        : "https://cdn-icons-png.flaticon.com/512/763/763775.png";

    const invoiceNo = `${uuidv4().slice(0, 8)}${new Date().getTime()}`;
    const invoiceDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const invoice = {
      customize: {
        template: fs.readFileSync(invoicePath, "base64"),
      },
      images: {
        logo: siteLogo,
        background: "",
      },
      sender: {
        company: siteData.siteName,
        address: siteData.coAddress.address,
        zip: siteData.coAddress.pincode,
        city: siteData.coAddress.city,
        country: siteData.coAddress.country,
      },
      client: BillerDetail,
      information: {
        number: NewOrder.id,
        date: invoiceDate,
      },
      products: invoiceProducts,
      "bottom-notice": `Thank you for your order! - ${siteData.siteName}`,
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
        number: "Invoice No", // Defaults to 'Number'
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
    const orderGenerated = await NewOrder.save();
    const result = await easyinvoice.createInvoice(invoice);

    const orderInvoice = new INVOICE({
      user: user_.id,
      order_id: orderGenerated.id,
      invoice: result.pdf,
    });
    await orderInvoice.save();

    const productTable = rawProducts
      .map(
        (product) =>
          `<tr>
            <td>${product.productName}</td>
            <td>${product.productQuantity}</td>
            <td>Rs.${product.productPrice}</td>
         </tr>`
      )
      .join("");

    user_data.cart = [];
    await user_data.save();

    const verifyMail = async (username, email, siteData) => {
      const subject = `Order Confirmation - Your Purchase with ${siteData.siteName}`;
      const htmlStyle = `
        @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap');.logo{padding:12px;padding-bottom:0}.footer{font-size:12px;color:#999}body{font-family:'Ubuntu',sans-serif;margin:0;padding:0;background-color:#e1f2f8}.container{background-color:#fff;padding:12px;margin:12px;box-shadow:0 0 8px #eae9e985;border-radius:12px}th:nth-child(1){width:  60%;}th:nth-child(2){width:  10%;}th:nth-child(3){width:  30%;}h1,h2,h3,h4,h5,h6{line-height:0}table,th{font-weight:400}thead tr{border:1px solid #b3b3b3;padding:2px 4px}tbody tr{border:1px solid #f1f1f1}tbody tr td{text-align:center}
        `;
      const htmlbody = `
        <div class="container">
        <div class="logo">
            <img width="52" src="${siteData.siteLogo}" alt="Logo">
        </div>
        <div class="content">
            <p style="line-height: 0px;">Dear ${username}</p>
            <p>We are delighted to confirm your recent purchase with ${
              siteData.siteName
            }. Thank you for choosing us for
                your Product needs.
            </p>
            <div style="border: 1px solid #e4e4e4; padding: 8px; border-radius: 8px;box-shadow: 0px 0px 2px #e6e6e690;">
                <span style="padding: 8px 0; display: block; font-weight: 500;">
                    Your order details are as follows:
                </span>
                <p>Date: <span style="font-weight: 500;">${invoiceDate}</span></p>
                <div>
                    <p>Shipping Address: <span style="font-weight: 500;">${Address}</span></p>
                </div>
                <div>
                    Order Summary:
                    <table style="border-collapse:collapse;width: 100%;">
                        <thead>
                            <tr>
                                <th >Product</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productTable}
                        </tbody>
                    </table>
                </div>
                <p>Payment Method: <span style="font-weight: 500;">Card</span></p>
            </div>
            <div>
                
                <p>Your purchase is now being processed and will be shipped to your provided address as soon as
                    possible. You can track the status of your order by logging into your ${
                      siteData.siteName
                    } account.
                </p>
                <p style="font-size: 12px;">We value your business and are committed to ensuring your satisfaction with
                    your purchase. Thank you for choosing [Website Name]. We look forward to serving you again in the
                    future.</p>
            </div>
        </div>
        <div class="footer">
            <p style="text-align: center;">© ${new Date().getFullYear()} ${
        siteData.siteName
      }. All rights reserved.</p>
        </div>
    </div>
        `;
      await sendMail(email, subject, htmlStyle, htmlbody);
    };
    await verifyMail(user_.fullName, user_.email, siteData);
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};
/* ------------------------ END Stripe Payment END ------------------------ */

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
        if (adminData.profileImg.path == "") {
          await USERREGISTERMODEL.findByIdAndUpdate(
            req.session.user_id || req.session.admin_id,
            {
              profileImg: {
                filename: image.filename,
                path: `/uploads/${image.filename}`,
              },
            }
          );
        } else {
          const oldImg = path.join(__dirname, "..", adminData.profileImg.path);
          if (fs.existsSync(oldImg)) {
            fs.unlinkSync(oldImg);
          }
        }
        await USERREGISTERMODEL.findByIdAndUpdate(
          req.session.user_id || req.session.admin_id,
          {
            profileImg: {
              filename: image.filename,
              path: `/uploads/${image.filename}`,
            },
          }
        );
      }
      req.flash("alert", "Profile Updated");
      res.redirect("/admin/profile#adminprofile");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("<h1>Internal Server Error</h1>");
  }
};

const updateSiteInfo = async (req, res) => {
  try {
    const isSiteInfo = await SITEINFO.findOne({}).sort({ timeStamp: -1 });
    const siteName = req.body.siteName;
    const siteUrl = req.body.siteURL;
    const SiteAddress = req.body.address;
    const pincode = req.body.pincode;
    const city = req.body.city;
    const country = req.body.country;
    const siteDescription = req.body.description;
    const contactInfo = req.body.contactInfo;
    const siteTiming = req.body.siteTiming;
    const siteMail = req.body.siteMail;

    // Handle the siteLogo
    let siteLogoPath = "";
    if (req.files.siteLogo && req.files.siteLogo.length > 0) {
      const siteLogo = req.files.siteLogo[0];
      // Delete the existing siteLogo from S3 if it exists
      if (isSiteInfo && isSiteInfo.siteLogo) {
        const siteLogoPath = path.join(siteUploadDir, isSiteInfo.siteLogo);
        fs.access(siteLogoPath);
        fs.unlink(siteLogoPath);
      }
      siteLogoPath = `/uploads/${siteLogo.filename}`;
    }

    const carouselImages = [];
    if (req.files.carouselImg && req.files.carouselImg.length > 0) {
      carouselImages.push(
        ...req.files.carouselImg.map((file) => ({
          filename: file.originalname,
          path: `/uploads/${file.originalname}`,
        }))
      );
    }

    if (isSiteInfo) {
      isSiteInfo.siteName = siteName;
      isSiteInfo.siteURL = siteUrl;
      isSiteInfo.coAddress = {
        address: SiteAddress,
        pincode: pincode,
        city: city,
        country: country,
      };
      isSiteInfo.siteDescription = siteDescription;
      isSiteInfo.siteTiming = siteTiming;
      isSiteInfo.siteMail = siteMail;
      isSiteInfo.contactInfo = contactInfo;

      if (req.files.siteLogo && req.files.siteLogo.length > 0) {
        isSiteInfo.siteLogo = siteLogoPath;
      }
      if (isSiteInfo.siteCarousel.length > 0) {
        // Delete existing siteCarousel images
        isSiteInfo.siteCarousel.forEach(async (image) => {
          const imagePath = path.join(siteLogoDir, image.path);
          fs.access(imagePath);
          fs.unlink(imagePath);
        });
      }
      if (carouselImages.length > 0) {
        isSiteInfo.siteCarousel = carouselImages;
      }
      await isSiteInfo.save();
    } else {
      // Create a new site info
      const siteInfoData = {
        siteName: siteName,
        siteLogo: siteLogoPath,
        siteURL: siteUrl,
        coAddress: {
          address: SiteAddress,
          pincode: pincode,
          city: city,
          country: country,
        },
        siteDescription: siteDescription,
        siteTiming: siteTiming,
        siteMail: siteMail,
        contactInfo: contactInfo,
        siteCarousel: carouselImages,
      };

      const siteInfo = new SITEINFO(siteInfoData);
      await siteInfo.save();
    }
    res.redirect("/admin/profile#adminperf");
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
  updateOrder,
  stripePay,
  stripePay_,
  paymentSuccessfull,
};
