const isAuthenticated = async(req, res, next) => {
  try{
    if (req.session.user_id) {
      next();
    } else {
      req.session.redirectPage = req.originalUrl;
      res.redirect('/login');
    }
  }catch(error){

  }
};

const islogout = (req, res, next) => {
  if (req.session.user_id) {
    req.session.redirectPage = req.originalUrl;
    res.redirect('/');
  } else {
    next();
  }
};

const userRegMiddleware = (req, res, next) => {
  if (req.session.user_id) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/');
  }
  next();
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      next();
    } else {
      res.render("404page", { userid: req.session.admin_id, cartval:req.cartval,siteInfo:req.siteInfo });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const isAdminLogout = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      res.redirect('/admin/dashboard');
    } else {
      res.render("adminLogin",{cartval:req.cartval,siteInfo:req.siteInfo});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


export { isAuthenticated, userRegMiddleware, islogout, isAdmin, isAdminLogout };