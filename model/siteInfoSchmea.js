import mongoose from "mongoose";

const siteInfoSchema = new mongoose.Schema({
  siteName: { type: String, default: "abcsite" },
  siteLogo: { type: String, default: "" },
  siteURL: {type: String,default: "localhost:3000"},
  coAddress: {
    address:{type:String, default:""},
    pincode:{type:String, default:""},
    city:{type:String, default:""},
    country:{type:String, default:""},
  },
  siteDescription:{type:String,default:""},
  contactInfo: [
    {
      type: String,
      default: "",
    }
  ],
  timeStampe: { type: Date, default: Date.now() },
});

const SITEINFO = mongoose.model("siteInformation", siteInfoSchema);
export default SITEINFO;
