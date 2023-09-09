import PRODUCTS from "../model/productSchema.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import PRODCOMMENTS from "../model/productCommentsSchema.js";
import USERREGISTERMODEL from "../model/UserAccount.js";

const singlepage = async (req, res) => {
  try {
    const { productId, productName } = req.params;
    const product = await PRODUCTS.findOne({
      productId: productId,
      name: productName,
    });
    req.session.redirectPage = req.originalUrl;
    const relatedproducts = await PRODUCTS.find({
      category: product.category,
      _id: { $ne: product._id },
    });

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    shuffleArray(relatedproducts);

    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "short", day: "2-digit" };
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString("en-US", options);

      const [month, day, year] = formattedDate.split(" ");
      const monthAbbreviation = month.slice(0, 3);

      return `${day}${monthAbbreviation}-${year}`;
    };

    const desc = JSON.parse(product.description);
    const converter = new QuillDeltaToHtmlConverter(desc.ops);
    const htmldesc = converter.convert();

    const comments = await PRODCOMMENTS.find({ product_id: product.id }).sort({
      createdAt: -1,
    });

    const isExist = await PRODCOMMENTS.findOne({
      $and: [{ product_id: product.id }, { user_id: req.session.user_id }],
    });

    res.status(200).render("productPage", {
      product,
      userid: req.user,
      cartval: req.cartval,
      desc: htmldesc,
      isExist,
      comments,
      formatDate,
      relatedproducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
};

const productComment = async (req, res) => {
  try {
    const { rate, reviewerTextarea, reviewerName, productId } = req.body;
    const product = await PRODUCTS.findOne({ _id: productId });
    const user = await USERREGISTERMODEL.findOne({ _id: req.session.user_id });
    const isExist = await PRODCOMMENTS.findOne({
      $and: [{ product_id: productId }, { user_id: req.session.user_id }],
    });

    if (isExist) {
      req.flash("commentalert", ["Review Already Submited! Thank You."]);
      if (req.session.redirectPage) {
        const redirectUrl = req.session.redirectPage;
        delete req.session.redirectPage;
        return res.redirect(redirectUrl);
      }
    } else {
      const comment = new PRODCOMMENTS({
        product_id: product.id,
        user_id: user.id,
        user: reviewerName,
        rating: rate,
        comment: reviewerTextarea,
      });
      const commented = await comment.save();
      if (req.session.redirectPage) {
        const redirectUrl = req.session.redirectPage;
        delete req.session.redirectPage;
        return res.redirect(redirectUrl);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
};

const policypage = async (req, res) => {
  res
    .status(200)
    .render("returnpolicy", { userid: req.user, cartval: req.cartval });
};

const shippingMethod = async (req, res) => {
  res
    .status(200)
    .render("shippingMethod", { userid: req.user, cartval: req.cartval });
};

const furntirueAssmbling = async (req, res) => {
  res
    .status(200)
    .render("furntiureAssmb", { userid: req.user, cartval: req.cartval });
};

const vistSotre = async (req, res) => {
  res.status(200).render("stores", { userid: req.user, cartval: req.cartval });
};

const aboutus = async (req, res) => {
  res.status(200).render("aboutus", { userid: req.user, cartval: req.cartval });
};

export {
  singlepage,
  productComment,
  policypage,
  shippingMethod,
  furntirueAssmbling,
  vistSotre,
  aboutus,
};
