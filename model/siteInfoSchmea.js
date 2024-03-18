import mongoose from "mongoose";

const siteInfoSchema = new mongoose.Schema({
  siteName: { type: String, default: "abcsite" },
  siteLogo: { type: String, default: "" },
  siteURL: { type: String, default: "localhost:5000" },
  coAddress: {
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  siteDescription: { type: String, default: "" },
  contactInfo: {
    type: String,
    default: "",
  },
  siteTiming: {
    type: String,
    default: "OPEN FROM 9AM TO 5PM – CLOSED ON WEEKENDS",
  },
  siteMail: {
    type: String,
    default: "abc@mail.com",
  },
  siteCarousel: [
    {
      filename: {
        type: String,
        default: "",
      },
      path: {
        type: String,
        default: "",
      },
    },
  ],
  timeStampe: { type: Date, default: Date.now() },
});

const SITEINFO = mongoose.model("siteInformation", siteInfoSchema);
export default SITEINFO;
