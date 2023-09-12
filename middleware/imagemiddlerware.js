import PRODUCTS from "../model/productSchema.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = req.originalUrl.includes('/product')
  ? './uploads/productImages'
  : req.originalUrl.includes('/my-account')
  ? './uploads/profileImages'
  : './uploads';
    cb(null, destinationPath);
  },
  filename: async function (req, file, cb) {
    try {
      
      const cleanedFilename = file.originalname.replace(/\(|\)/g, '').trim();

      // Combine productId and the cleaned filename to create a new filename
      const ImgName = `${uuidv4()}_${cleanedFilename}`;

      cb(null, ImgName);
    } catch (error) {
      cb(error);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 12, // 12 MB limit
  },
});

const upload = multer({ storage: storage });
export default upload;
