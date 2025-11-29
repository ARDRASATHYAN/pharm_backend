// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const cookieParser = require("cookie-parser");
const { default: helmet } = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const storeRouter = require("./routes/storeRoutes");




const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.set('trust proxy', true);

// route mounting
app.use("/api/user",userRouter);
app.use("/api/store",storeRouter);


const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("DB connected");
    return sequelize.sync(); // { alter: true } in dev only
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to DB:", err);
  });
