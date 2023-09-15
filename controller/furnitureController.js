import USERREGISTERMODEL from "../model/UserAccount.js";
import PRODUCTS from "../model/productSchema.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import sortProducts from "../middleware/sortbyMiddleware.js";
import pagination from "../middleware/pagination.js";


const convertBedDescriptions = (beds) => {
    beds.forEach((bed) => {
      const desc = JSON.parse(bed.description);
      const converter = new QuillDeltaToHtmlConverter(desc.ops);
      bed.htmldesc = converter.convert();
    });
};

const searchQuries = async (req, res) => {
  try {
    const alldata = await PRODUCTS.find({})
    req.session.redirectPage = req.originalUrl;
    const query = req.query.s_query;
    const  Queryproduct = alldata.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query.toLowerCase());
      const titleMatch = product.title.toLowerCase().includes(query.toLowerCase());
      const categoryMatch = product.category.toLowerCase().includes(query.toLowerCase());
      return nameMatch || titleMatch || categoryMatch;
    });
    convertBedDescriptions(Queryproduct);

    const totalProducts = Queryproduct.length;
    const page = parseInt(req.query.page) || 1;
    const ITEMS_PER_PAGE = 6;
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const items = Queryproduct.slice(skip, skip + ITEMS_PER_PAGE);

    const { sort } = req.query;
    const { sortedProducts, sortStatusText } = sortProducts(sort, items);

    res.render("singlepage", {
      page: "Search",
      title: "Search: "+ query,
      userid: req.user, cartval:req.cartval,
      products: sortedProducts,
      sortStatusText,
      currentPage: page,
      totalPages: totalPages,
      totalProducts,
      itemsPerPage: ITEMS_PER_PAGE,
      currentQuery: req.query,
      siteInfo:req.siteInfo
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const furniturecontroller = async (req, res) => {
  try {
    const furniture = await PRODUCTS.find({})
    convertBedDescriptions(furniture);
    const { sort } = req.query;
    const { sortedProducts, sortStatusText } = sortProducts(sort, furniture);
    req.session.redirectPage = req.originalUrl;
    const pagiD = pagination(req, sortedProducts);

    res.render("singlepage", {
      page: "Furniture",
      title: "furniture",
      userid: req.user, cartval:req.cartval,
      products: pagiD.items,
      sortStatusText,
      currentPage: pagiD.currentPage,
      totalPages: pagiD.totalPages,
      totalProducts: pagiD.totalProducts,
      itemsPerPage: pagiD.itemsPerPage,
      currentQuery: req.query,
      siteInfo:req.siteInfo
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const bedcontroller = async (req, res) => {
  try {
    const beds = await PRODUCTS.find({ category: "Bed" });
    convertBedDescriptions(beds);
    const { sort } = req.query;
    const { sortedProducts, sortStatusText } = sortProducts(sort, beds);
    req.session.redirectPage = req.originalUrl;
    const pagiD = pagination(req, sortedProducts);

    res.render("singlepage", {
      page: "Beds",
      title: "Beds",
      userid: req.user, cartval:req.cartval,
      products: pagiD.items,
      sortStatusText,
      currentPage: pagiD.currentPage,
      totalPages: pagiD.totalPages,
      totalProducts: pagiD.totalProducts,
      itemsPerPage: pagiD.itemsPerPage,
      currentQuery: req.query,
      siteInfo:req.siteInfo
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const storagecontroller = async (req, res) => {
  const storage = await PRODUCTS.find({ category: "Storage" });
  convertBedDescriptions(storage);
  const { sort } = req.query;
  const { sortedProducts, sortStatusText } = sortProducts(sort, storage);
  req.session.redirectPage = req.originalUrl;
  const pagiD = pagination(req, sortedProducts);

  res.render("singlepage", {
    page: "Storage",
    title: "Storage",
    userid: req.user, cartval:req.cartval,
    products: pagiD.items,
    sortStatusText,
    currentPage: pagiD.currentPage,
    totalPages: pagiD.totalPages,
    totalProducts: pagiD.totalProducts,
    itemsPerPage: pagiD.itemsPerPage,
    currentQuery: req.query,
    siteInfo:req.siteInfo
  });
};

const seatingcontroller = async (req, res) => {
  const seating = await PRODUCTS.find({ category: "Seating" });
  convertBedDescriptions(seating);
  const { sort } = req.query;
  const { sortedProducts, sortStatusText } = sortProducts(sort, seating);
  req.session.redirectPage = req.originalUrl;
  const pagiD = pagination(req, sortedProducts);

  res.render("singlepage", {
    page: "Seating",
    title: "Seating",
    userid: req.user, cartval:req.cartval,
    products: pagiD.items,
    sortStatusText,
    currentPage: pagiD.currentPage,
    totalPages: pagiD.totalPages,
    totalProducts: pagiD.totalProducts,
    itemsPerPage: pagiD.itemsPerPage,
    currentQuery: req.query,
    siteInfo:req.siteInfo
  });
};

const tablescontroller = async (req, res) => {
  const tables = await PRODUCTS.find({ category: "Table" });
  convertBedDescriptions(tables);
  const { sort } = req.query;
  const { sortedProducts, sortStatusText } = sortProducts(sort, tables);
  req.session.redirectPage = req.originalUrl;
  const pagiD = pagination(req, sortedProducts);

  res.render("singlepage", {
    page: "Tabels",
    title: "Tables",
    userid: req.user, cartval:req.cartval,
    products: pagiD.items,
    sortStatusText,
    currentPage: pagiD.currentPage,
    totalPages: pagiD.totalPages,
    totalProducts: pagiD.totalProducts,
    itemsPerPage: pagiD.itemsPerPage,
    currentQuery: req.query,
    siteInfo:req.siteInfo
  });
};

const studytablecontroller = async (req, res) => {
  const tables = await PRODUCTS.find({ category: "Table" });
  req.session.redirectPage = req.originalUrl;
  const query = "study" || "study table";
  
  const  Queryproduct = tables.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(query.toLowerCase());
    const titleMatch = product.title.toLowerCase().includes(query.toLowerCase());
    const categoryMatch = product.category.toLowerCase().includes(query.toLowerCase());
    return nameMatch || titleMatch || categoryMatch;
  });

  convertBedDescriptions(Queryproduct);
  const { sort } = req.query;
  const { sortedProducts, sortStatusText } = sortProducts(sort, Queryproduct);

  const pagiD = pagination(req, sortedProducts);

  res.render("singlepage", {
    page: "Tabels",
    title: "Tables",
    userid: req.user, cartval:req.cartval,
    products: pagiD.items,
    sortStatusText,
    currentPage: pagiD.currentPage,
    totalPages: pagiD.totalPages,
    totalProducts: pagiD.totalProducts,
    itemsPerPage: pagiD.itemsPerPage,
    currentQuery: req.query,
    siteInfo:req.siteInfo
  });
};

const outdoorcontroller = async (req, res) => {
  const outdoors = await PRODUCTS.find({ category: "Outdoor" });
  convertBedDescriptions(outdoors);
  const { sort } = req.query;
  const { sortedProducts, sortStatusText } = sortProducts(sort, outdoors);
  req.session.redirectPage = req.originalUrl;
  const pagiD = pagination(req, sortedProducts);
  res.render("singlepage", {
    page: "Outdoors",
    title: "Outdoors",
    userid: req.user, cartval:req.cartval,
    products: pagiD.items,
    sortStatusText,
    currentPage: pagiD.currentPage,
    totalPages: pagiD.totalPages,
    totalProducts: pagiD.totalProducts,
    itemsPerPage: pagiD.itemsPerPage,
    currentQuery: req.query,
    siteInfo:req.siteInfo
  });
};

const othercontroller = async (req, res) => {
  const others = await PRODUCTS.find({ category: "Other" });
  convertBedDescriptions(others);
  const { sort } = req.query;
  const { sortedProducts, sortStatusText } = sortProducts(sort, others);
  req.session.redirectPage = req.originalUrl;
  const pagiD = pagination(req, sortedProducts);
  res.render("singlepage", {
    page: "Others",
    title: "Others",
    userid: req.user, cartval:req.cartval,
    products: pagiD.items,
    sortStatusText,
    currentPage: pagiD.currentPage,
    totalPages: pagiD.totalPages,
    totalProducts: pagiD.totalProducts,
    itemsPerPage: pagiD.itemsPerPage,
    currentQuery: req.query,
    siteInfo:req.siteInfo
  });
};

export {
  bedcontroller,
  storagecontroller,
  seatingcontroller,
  tablescontroller,
  outdoorcontroller,
  othercontroller,
  studytablecontroller,
  furniturecontroller,
  searchQuries,
};
