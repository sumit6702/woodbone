import SITEINFO from "../model/siteInfoSchmea.js";

const siteData = async (req, res, next) => {
  try {
    const siteInfo = await SITEINFO.findOne({})
      .sort({ timeStamp: -1 })
      .exec();
    if (siteInfo) {
      req.siteInfo = siteInfo;
      next();
    } else {
      req.siteInfo = {
        siteName: "",
        siteLogo: "",
        siteURL: "",
        coAddress: {
          address: "",
          pincode: "",
          city: "",
          country: ""
        },
        siteDescription: "",
        contactInfo: [],
        timeStampe: {
          "$date": "2023-10-03T10:44:50.510Z"
        },
        "__v": 0
      }
      next();
      // res.status(404).json({ error: "Site information not found" });
    }
  } catch (error) {
    console.error("Error fetching user information:", error);
    next(error);
  }
};

export default siteData;
