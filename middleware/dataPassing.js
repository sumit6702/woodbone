import USERREGISTERMODEL from "../model/UserAccount.js";
import USERDATA from "../model/UserDataSchema.js";

const getUserInfo = async (req, res, next) => {
  try {
    let userId = req.session.user_id;
    let isUser = await USERREGISTERMODEL.findOne({ _id: userId, role:"user" });
    let isAdmin = await USERREGISTERMODEL.findOne({ _id: userId, role:"admin" });
    let userval = await USERDATA.findOne({ user: userId });
    let user ;
    let isCart = 0;
    if(userId || isAdmin){
      user = isUser || isAdmin;
      isCart = userval.cart.length;
    }else{
      if(req.session.cart && Array.isArray(req.session.cart)){
        isCart = req.session.cart.length;
      }
    }
    req.user = user;
    req.cartval = isCart;
    next();
  } catch (error) {
    console.error("Error fetching user information:", error);
    next(error);
  }
};

export default getUserInfo;
