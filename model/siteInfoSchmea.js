import mongoose from "mongoose";

const siteInfoSchema = new mongoose.Schema({
  siteName: { type: String, default: "ABC" },
  siteLogo: { type: String, default: "" },
  timeStampe: { type: Date, default: Date.now() },
});

const SITEINFO = mongoose.model("siteInformation", siteInfoSchema);
export default SITEINFO;
