import 'dotenv/config'
import express from "express";
const app = express();
const port = process.env.PORT || 3080;
import router from "./router/router.js";
import connectDB from "./db/database.js";
import bodyParser from "body-parser";
import { secretkey } from "./config/session.js";
import session from "express-session";
import flash from "express-flash";
import cookieParser from "cookie-parser";
import { PagenotFound } from "./controller/indexController.js";

//Database Config
const DATABASE_URL = process.env.MONGO_URL ;
connectDB(DATABASE_URL);

//cookie parser
app.use(cookieParser());

//Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));

//session
app.use(
  session({
    secret: secretkey,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

//flahs
app.use(flash());

//Pages Config
app.use("/", router);

//File Config
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(PagenotFound);

//port listing
app.listen(port, () => {
  console.log(`listing to https://localhost:${port}`);
});
