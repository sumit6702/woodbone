import express from "express";
const router = express.Router();
import {
  indexcontroller,
  pagetesterscontroller,
  contactcontroller,
  contactQueries,
} from "../controller/indexController.js";
import {
  logincontroller,
  userloginController,
  adminLoginController,
  logoutController,
  resetAdminController,
  resetAdminPassController,
  verifyotp,
  newAdminPassword,
} from "../controller/loginController.js";
import {
  singupcontroller,
  newsingupController,
  verifiedmailcontroller,
} from "../controller/singupController.js";
import {
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
} from "../controller/dashboardController.js";
import {
  singlepage,
  productComment,
  policypage,
  shippingMethod,
  furntirueAssmbling,
  vistSotre,
  aboutus,
} from "../controller/productpageController.js";
import {
  cartController,
  addtoCartController,
  updateCartController,
  removeCartItemController,
  wishlistcontroller,
  removewishlistController,
  addwishlistController,
} from "../controller/cartController.js";
import {
  bedcontroller,
  storagecontroller,
  seatingcontroller,
  tablescontroller,
  outdoorcontroller,
  othercontroller,
  studytablecontroller,
  furniturecontroller,
  searchQuries,
} from "../controller/furnitureController.js";
import {
  isAuthenticated,
  islogout,
  isAdmin,
  isAdminLogout,
} from "../middleware/mainCon.js";
import {
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
} from "../controller/accountController.js";

import limiter from "../middleware/ratemiddleware.js";
import upload from "../middleware/imagemiddlerware.js";
import verifyResetToken from "../middleware/tokkenUtil.js";
import getUserInfo from "../middleware/dataPassing.js";

router.use(getUserInfo);
router.get("/", indexcontroller);
router.get("/search", searchQuries);

//User
router.post("/login", limiter, userloginController);
router.post("/singup", newsingupController);
router.get("/login", islogout, logincontroller);
router.get("/logout", logoutController);
router.get("/singup", singupcontroller);
router.post("/updateuser", isAuthenticated, updateUser);
router.post("/updatePassword", isAuthenticated, userPasswordUpdate);
router.get("/singup/verify/:id?", verifiedmailcontroller);
router.get("/my-account", isAuthenticated, useraccount);
router.post("/addAddress", isAuthenticated, newAddress);
router.post("/upadtedefaultaddress", isAuthenticated, updatedefaultAddress);
router.post("/updateAddress", isAuthenticated, updateAddress);
router.post("/deleteAddress", isAuthenticated, deletAddress);
router.get("/orders", isAuthenticated, order);
router.get("/checkout", isAuthenticated, checkout);
router.get("/order/succesful", isAuthenticated, paymentS);
router.get("/order/failed", isAuthenticated, paymentF);
router.post("/paynow", payment);
router.post("callback", paymentResponse);
router.get("/download-invoice/:id", isAuthenticated, getInvoice);
router.post("/product_comment", isAuthenticated, productComment);

//OTHERS||
router.get("/cart", cartController);
router.get("/add-cart/:productId/:productName/:quantity", addtoCartController);
router.post("/add-cart/:productId", updateCartController);
router.get("/remove-cart/:productId", removeCartItemController);
router.get("/wishlist", isAuthenticated, wishlistcontroller);
router.post("/add_wishlist/:productId", isAuthenticated, addwishlistController);
router.post(
  "/remove_wishlist/:productId",
  isAuthenticated,
  removewishlistController
);
router.get("/contactus", contactcontroller);
router.post("/contactus", contactQueries);
router.get("/returnPolicy", policypage);
router.get("/shippingMethod", shippingMethod);
router.get("/furnitureassmbling", furntirueAssmbling);
router.get("/outstores", vistSotre);
router.get("/aboutus", aboutus);

//RESET||NEW PASSWORDS
router.get("/account/reset-password", forgetPass);
router.get("/account/new_password/:id?", verifyResetToken, PasswordUpdated);
router.post("/account/reset-password", PasswordUpdate);
router.post("/account/new_password/:id?", verifyResetToken, resetPassUpdated);

//Furniture Pages
router.get("/furniture", furniturecontroller);
router.get("/furniture/beds", bedcontroller);
router.get("/furniture/storage", storagecontroller);
router.get("/furniture/seating", seatingcontroller);
router.get("/furniture/tables", tablescontroller);
router.get("/furniture/outdoors", outdoorcontroller);
router.get("/furniture/others", othercontroller);
router.get("/product/:productId/:productName", singlepage);
router.get("/furniture/tables/study_tables", studytablecontroller);

//Admin Pages
router.get("/admin/login", isAdminLogout, admincontroller);
router.get("/admin/login/reset_Password", resetAdminController);
router.post("/admin/login/reset_Password", resetAdminPassController);
router.post("/admin/login/verify_otp", verifyotp);
router.post("/admin/login/new_admin_password", newAdminPassword);
router.post("/admin/login", limiter, adminLoginController);
router.get("/admin/dashboard", isAdmin, dashboardcontroller);
router.get("/admin/products", isAdmin, productDBcontroller);
router.post(
  "/admin/products",
  isAdmin,
  upload.array("pd_images", 12),
  uploadPDcontroller
);
router.get("/admin/orders", isAdmin, customerDBcontroller);
router.get("/admin/log_activity", isAdmin, loginActivityDBcontroller);
router.post("/delete_adminlogins", isAdmin, deleteloginActcontroller);
router.get("/admin/transcation", isAdmin, transcationDBcontroller);
router.get("/admin/statistics", isAdmin, statisticsDBcontroller);
router.get("/admin/profile", isAdmin, adminProfileDBcontroller);
router.get("/admin/products/delete/:id", isAdmin, deleteproduct);
router.get("/admin/products/search", isAdmin, productquries);
router.get("/admin/product/:productId", isAdmin, updateproduct);
router.get(
  "/img/delete/:productId/:imageId/:index",
  isAdmin,
  singleimageremover
);
router.post(
  "/img/edit/updateOne",
  isAdmin,
  upload.single("imageInput"),
  singleimageedit
);
router.post(
  "/admin/product/update",
  isAdmin,
  upload.array("pd_images", 12),
  updatenewProduct
);
router.post("/admin/profile/updatepassword", isAdmin, passwordChange);
router.post("/admin/profile/updateprofile", isAdmin, updateAdminProfile);
router.post(
  "/admin/profile/updateprofileimg",
  upload.single("userProfile"),
  profileUploader
);

router.get("/pagetest", pagetesterscontroller);

export default router;
