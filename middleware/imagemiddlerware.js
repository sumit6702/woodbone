import 'dotenv/config'
import aws from 'aws-sdk';
// import { S3Client } from '@aws-sdk/client-s3';
import multer from "multer";
import multerS3 from "multer-s3";

aws.config.update({
  accessKeyId: process.env.S3_ACCESSKEY,
  secretAccessKey: process.env.S3_SECRECTKEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3()

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: "public-read",
    contentDisposition: 'inline',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const cleanedFilename = file.originalname.replace(/\(|\)/g, "").trim();
      const imgName = `${Date.now()}_${cleanedFilename}`;
      cb(null, imgName.toString());
    },
  }),
});
export default upload;
/* 1696957915436_blossom+1.jpg */