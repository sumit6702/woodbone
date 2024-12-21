import multer from "multer";
import path from "path";
import fs from "fs-extra";

// Define the upload directory
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure the directory exists
fs.ensureDirSync(uploadDir);

// Multer configuration for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Files will be saved in the `uploads` directory
  },
  filename: (req, file, cb) => {
    const cleanedFilename = file.originalname.replace(/\(|\)/g, "").trim();
    const imgName = `${Date.now()}_${cleanedFilename}`;
    cb(null, imgName); // Add timestamp to avoid conflicts
  },
});

const upload = multer({ storage });

export default upload;
