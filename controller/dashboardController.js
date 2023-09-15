import LOGINATTEMPT from "../model/Loginattempt.js";
import PRODUCTS from "../model/productSchema.js";
import ORDERS from "../model/orderSchema.js";
import USERDATA from "../model/UserDataSchema.js";
import USERREGISTERMODEL from "../model/UserAccount.js";
import { query } from "express";
import pagination from "../middleware/pagination.js";
import { promises as fsPromises } from "fs";

const admincontroller = (req, res) => {
  res.render("adminLogin");
};

const dashboardcontroller = async (req, res) => {
  const orders = await ORDERS.find({});
  const users = await USERREGISTERMODEL.find({ role: "user" });
  const prodcuts = await PRODUCTS.find({});
  const admin = await USERREGISTERMODEL.findOne({
    _id: req.session.admin_id,
    role: "admin",
  });
  let Revenue = 0;
  orders.forEach((o) => {
    Revenue += o.orderprice;
  });
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "2-digit" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);

    const [month, day, year] = formattedDate.split(" ");
    const monthAbbreviation = month.slice(0, 3);

    return `${day}${monthAbbreviation}-${year}`;
  };
  /* ---------------------------- Quarterly Orders ---------------------------- */
  const today = new Date();
  function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
  function getStartOfMonthAgo(monthsAgo) {
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - monthsAgo);
    startDate.setDate(1);
    return startDate;
  }

  function getEndOfMonthAgo(monthsAgo) {
    const endDate = getStartOfMonthAgo(monthsAgo);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Setting to the last day of the previous month
    return endDate;
  }

  const thirdLastMonthStart = getStartOfMonthAgo(3);
  const secondLastMonthStart = getStartOfMonthAgo(2);
  const lastMonthStart = getStartOfMonthAgo(1);

  const thirdLastMonthEnd = getEndOfMonthAgo(3);
  const secondLastMonthEnd = getEndOfMonthAgo(2);
  const lastMonthEnd = getEndOfMonthAgo(1);

  const thirdLastMonthOrders = await ORDERS.find({
    createdAt: {
      $gte: thirdLastMonthStart,
      $lt: thirdLastMonthEnd,
    },
  });

  const secondLastMonthOrders = await ORDERS.find({
    createdAt: {
      $gte: secondLastMonthStart,
      $lt: secondLastMonthEnd,
    },
  });

  const lastMonthOrders = await ORDERS.find({
    createdAt: {
      $gte: lastMonthStart,
      $lt: lastMonthEnd,
    },
  });

  const orderLengths = [
    thirdLastMonthOrders.length,
    secondLastMonthOrders.length,
    lastMonthOrders.length,
  ];

  /* ---------------------------- Top FOUR Products --------------------------- */
  const allProductQuantities = [];

  orders.forEach((order) => {
    order.products.forEach((product) => {
      allProductQuantities.push({
        productId: product.product_id,
        productQuantity: product.ProductQuantity,
      });
    });
  });

  const productQuantityCount = allProductQuantities.reduce(
    (acc, { productId, productQuantity }) => {
      if (!acc[productId]) {
        acc[productId] = 0;
      }
      acc[productId] += productQuantity;
      return acc;
    },
    {}
  );

  const productQuantityCountArray = Object.entries(productQuantityCount).map(
    ([productId, totalQuantity]) => ({
      productId,
      totalQuantity,
    })
  );

  productQuantityCountArray.sort((a, b) => b.totalQuantity - a.totalQuantity);

  const top4ProductIds = productQuantityCountArray
    .slice(0, 4)
    .map((entry) => entry.productId);
  let counts = [];
  productQuantityCountArray.forEach((ids) => {
    counts.push(ids.totalQuantity);
  });

  const top4Products = prodcuts.filter((product) =>
    top4ProductIds.includes(product.id)
  );

  res.render("ADdashboard", {
    Revenue,
    admin,
    users,
    orders,
    prodcuts,
    Revenue,
    formatDate,
    orderLengths,
    top4Products,
    counts,
    siteInfo: req.siteInfo,
  });
};

const productDBcontroller = async (req, res) => {
  try {
    const products = (await PRODUCTS.find({}).sort({ timestamp: -1 })) || null;

    const pagiD = pagination(req, products);
    const { sort } = req.query;
    const noofproducts = products.length;
    req.session.redirectPage = req.originalUrl;
    const admin = await USERREGISTERMODEL.findOne({
      _id: req.session.admin_id,
      role: "admin",
    });

    res.render("ADproducts", {
      products: pagiD.items,
      currentPage: pagiD.currentPage,
      totalPages: pagiD.totalPages,
      totalProducts: pagiD.totalProducts,
      itemsPerPage: pagiD.itemsPerPage,
      currentQuery: req.query,
      noofproducts,
      admin,
      siteInfo: req.siteInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("<h2>Internal Server Error at singlePage</h2>");
  }
};

const productquries = async (req, res) => {
  try {
    const products = (await PRODUCTS.find({})) || null;
    const query = req.query.s_query;
    const Queryproduct = products.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const titleMatch = product.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const categoryMatch = product.category
        .toLowerCase()
        .includes(query.toLowerCase());
      const productId = product.productId
        .toLowerCase()
        .includes(query.toLowerCase());
      return nameMatch || titleMatch || categoryMatch || productId;
    });

    const pagiD = pagination(req, Queryproduct);
    const noofproducts = Queryproduct.length;
    req.session.redirectPage = req.originalUrl;
    const admin = await USERREGISTERMODEL.findOne({
      _id: req.session.admin_id,
      role: "admin",
    });

    res.render("ADproducts", {
      products: pagiD.items,
      currentPage: pagiD.currentPage,
      totalPages: pagiD.totalPages,
      totalProducts: pagiD.totalProducts,
      itemsPerPage: pagiD.itemsPerPage,
      currentQuery: req.query,
      noofproducts,
      admin,
      siteInfo: req.siteInfo,
    });

    // res.render("ADproducts", {
    //   products,
    //   Queryproduct,
    //   currentPage: page,
    //   totalPages: totalPages,
    //   totalProducts,
    //   itemsPerPage: ITEMS_PER_PAGE,
    //   currentQuery: req.query,
    // });
  } catch (error) {}
};

const updateproduct = async (req, res) => {
  const { productId } = req.params;
  const product = await PRODUCTS.findOne({ productId: productId });
  const admin = await USERREGISTERMODEL.findOne({
    _id: req.session.admin_id,
    role: "admin",
  });
  req.session.redirectPage = req.originalUrl;
  res.render("ADeditproduct", { product, admin, siteInfo: req.siteInfo });
};

const deleteproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteProduct = await PRODUCTS.findByIdAndDelete(id);
    if (deleteProduct) {
      req.flash("alert", `${deleteProduct.name} is deleted!`);
      res.redirect("/admin/products");
    } else {
      req.flash("alert", `${deleteProduct.name} is not found!`);
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
};

const singleimageremover = async (req, res) => {
  try {
    const { productId, imageId, index } = req.params;
    const product = await PRODUCTS.findById(productId);
    const prodcutPath = product.Image[index].path;
    if (
      product &&
      product.Image &&
      index >= 0 &&
      index < product.Image.length
    ) {
      const img = product.Image.splice(index, 1);

      if (img) {
        await fsPromises.unlink(prodcutPath);
      }

      await product.save();
      const url = req.session.redirectPage;
      delete req.session.redirectPage;
      return res.redirect(url);
    } else {
      console.log("Can't Delete Image!");
      const url = req.session.redirectPage;
      delete req.session.redirectPage;
      return res.redirect(url);
    }
  } catch (error) {}
};

const singleimageedit = async (req, res) => {
  try {
    const currentPdId = req.body.currentPdId;
    const currentImgIndex = req.body.currentImg;
    const uploadedFile = req.file;
    const product = await PRODUCTS.findById(currentPdId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const imageObject = product.Image[currentImgIndex];
    const previousImagePath = imageObject.path;

    // Assign the new values to imageObject
    imageObject.filename = uploadedFile.filename;
    imageObject.path = uploadedFile.path;

    // Save the updated product
    const imgAdded = await product.save();

    if (imgAdded) {
      await fsPromises.unlink(previousImagePath);
      const url = req.session.redirectPage;
      delete req.session.redirectPage;
      return res.redirect(url);
    } else {
      const url = req.session.redirectPage;
      delete req.session.redirectPage;
      return res.redirect(url);
    }
  } catch (error) {}
};

const updatenewProduct = async (req, res) => {
  try {
    //Getting Values and Accessing
    const productId = req.body.currentproductId;
    const pd_name = req.body.pd_name;
    const pd_title = req.body.pd_title;
    const pd_sku = req.body.pd_sku;
    const pd_category = req.body.pd_category;
    const pd_price = req.body.pd_price;
    const pd_stocks = req.body.pd_stocks;
    const pd_dimension = req.body.pd_dimension;
    const pd_variants = req.body.pd_variants;
    const pd_color = req.body.pd_color;
    const pd_style = req.body.pd_style;
    const pd_desc_editor = req.body.deltaJSON;
    const pd_photos = req.files;
    const pd_images = [];
    for (let i = 0; i < pd_photos.length; i++) {
      const file = pd_photos[i];
      pd_images.push({
        filename: file.filename,
        path: file.path,
      });
    }

    const existingProduct = await PRODUCTS.findById(productId);
    let updatedProduct;

    if (existingProduct.Image.length !== 0) {
      const updatedImages = existingProduct.Image.concat(pd_images);
      const updateThisProduct = {
        name: pd_name,
        title: pd_title,
        sku: pd_sku,
        category: pd_category,
        price: pd_price,
        stocks: pd_stocks,
        Information: {
          dimension: pd_dimension,
          variants: pd_variants,
          color: pd_color,
          style: pd_style,
        },
        Image: updatedImages,
        description: pd_desc_editor,
        timestamp: new Date(),
      };
      updatedProduct = await PRODUCTS.findByIdAndUpdate(
        productId,
        updateThisProduct
      );
    } else {
      const updateThisProduct = {
        name: pd_name,
        title: pd_title,
        sku: pd_sku,
        category: pd_category,
        price: pd_price,
        stocks: pd_stocks,
        Information: {
          dimension: pd_dimension,
          variants: pd_variants,
          color: pd_color,
          style: pd_style,
        },
        Image: pd_images,
        description: pd_desc_editor,
        timestamp: new Date(),
      };
      updatedProduct = await PRODUCTS.findByIdAndUpdate(
        productId,
        updateThisProduct
      );
    }

    if (updatedProduct) {
      req.flash("alert", `${updatedProduct.name} is Added`);
      res.status(200).redirect("/admin/products");
    } else {
      req.flash("alert", `Error Can't Upload`);
      res.status(500).json({ Error: "Error Cant Upload" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const customerDBcontroller = async (req, res) => {
  const admin = await USERREGISTERMODEL.findOne({
    _id: req.session.admin_id,
    role: "admin",
  });
  const orders = await ORDERS.find({});
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "2-digit" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);

    const [month, day, year] = formattedDate.split(" ");
    const monthAbbreviation = month.slice(0, 3);

    return `${day}${monthAbbreviation}-${year}`;
  };
  res.render("ADorders", { orders, formatDate, admin, siteInfo: req.siteInfo });
};

const loginActivityDBcontroller = async (req, res) => {
  const admin = await USERREGISTERMODEL.findOne({
    _id: req.session.admin_id,
    role: "admin",
  });
  const logins = await LOGINATTEMPT.find({}).sort({ timestamp: -1 });
  res.render("ADloginactivity", { logins, admin, siteInfo: req.siteInfo });
};

const deleteloginActcontroller = async (req, res) => {
  try {
    const selectedRows = req.body.selectedRows || [];
    const logins = await LOGINATTEMPT.find({}).sort({ timestamp: -1 });
    const rowlenght = selectedRows.length || 0;

    for (const i of selectedRows) {
      if (!isNaN(i) && logins[i]) {
        const logId = logins[i]._id;
        await LOGINATTEMPT.findByIdAndDelete(logId);
      }
    }
    req.flash("alert", `${rowlenght} log is deleted`);
    res.redirect("/admin/log_activity");
  } catch (error) {
    console.error("Error deleting rows:", error.message);
    res.status(500).send("Error deleting rows");
  }
};

const transcationDBcontroller = async (req, res) => {
  const admin = await USERREGISTERMODEL.findOne({
    _id: req.session.admin_id,
    role: "admin",
  });
  const orders = await ORDERS.find({});
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "2-digit" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);

    const [month, day, year] = formattedDate.split(" ");
    const monthAbbreviation = month.slice(0, 3);

    return `${day}${monthAbbreviation}-${year}`;
  };
  res.render("TranscationDB", {
    orders,
    formatDate,
    admin,
    siteInfo: req.siteInfo,
  });
};

const statisticsDBcontroller = async (req, res) => {
  const admin = await USERREGISTERMODEL.findOne({
    _id: req.session.admin_id,
    role: "admin",
  });
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const orders = await ORDERS.find({
    $expr: {
      $and: [
        { $eq: [{ $year: "$createdAt" }, currentYear] },
        { $eq: [{ $month: "$createdAt" }, currentMonth] },
      ],
    },
  });
  res.render("ADstatistics", { admin, orders, siteInfo: req.siteInfo });
};

const uploadPDcontroller = async (req, res) => {
  const pd_name = req.body.pd_name;
  const pd_title = req.body.pd_title;
  const pd_sku = req.body.pd_sku;
  const pd_category = req.body.pd_category;
  const pd_price = req.body.pd_price;
  const pd_stocks = req.body.pd_stocks;
  const pd_dimension = req.body.pd_dimension;
  const pd_variants = req.body.pd_variants;
  const pd_color = req.body.pd_color;
  const pd_style = req.body.pd_style;
  const pd_desc_editor = req.body.deltaJSON;
  const pd_photos = req.files;
  const pd_images = [];
  for (let i = 0; i < pd_photos.length; i++) {
    const file = pd_photos[i];
    pd_images.push({
      filename: file.filename,
      path: file.path,
    });
  }

  const lastProduct =
    (await PRODUCTS.findOne().sort({ timestamp: -1 })) || null;

  let counter;
  if (lastProduct && lastProduct.productId) {
    const lastFourDigits = lastProduct.productId.slice(-4);
    counter = parseInt(lastFourDigits, 10);
  } else {
    counter = 0; // Assuming the initial counter starts at 0
  }

  const generateSequentialUuid = () => {
    counter++;
    const uuid = "wdbonepd-";
    const sequenceUuid = uuid + counter.toString().padStart(4, "0");
    return sequenceUuid;
  };

  try {
    const newProduct = new PRODUCTS({
      productId: generateSequentialUuid(),
      name: pd_name,
      title: pd_title,
      sku: pd_sku,
      category: pd_category,
      price: pd_price,
      stocks: pd_stocks,
      Information: {
        dimension: pd_dimension,
        variants: pd_variants,
        color: pd_color,
        style: pd_style,
      },
      Image: pd_images,
      description: pd_desc_editor,
      timestamp: new Date(),
    });

    if (counter !== "") {
      const saveProduct = await newProduct.save();
      if (saveProduct) {
        req.flash("alert", `${saveProduct.name} is Added`);
        res.status(200).redirect("/admin/products");
      } else {
        req.flash("alert", `Error Can't Upload`);
        res.status(500).json({ Error: "Error Cant Upload" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const adminProfileDBcontroller = async (req, res) => {
  const admin = await USERREGISTERMODEL.findOne({
    _id: req.session.admin_id,
    role: "admin",
  });
  res.render("ADprofile", { admin, siteInfo: req.siteInfo });
};

export {
  dashboardcontroller,
  productDBcontroller,
  customerDBcontroller,
  loginActivityDBcontroller,
  transcationDBcontroller,
  statisticsDBcontroller,
  admincontroller,
  uploadPDcontroller,
  deleteloginActcontroller,
  adminProfileDBcontroller,
  deleteproduct,
  productquries,
  updateproduct,
  singleimageremover,
  singleimageedit,
  updatenewProduct,
};
