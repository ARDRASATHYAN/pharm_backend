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
const itemRouter = require("./routes/itemRoutes");
const hsnRouter = require("./routes/hsnRoutes");
const drugscheduleRouter = require("./routes/drugScheduleRoutes");
const purchaseRouter = require("./routes/purchaseRoutes");
const supplierRouter = require("./routes/supplierRoutes");
const stockRouter = require("./routes/stockRoutes");
const startCleanupJob = require("./utils/cleanupTokens");
const authRouter = require("./routes/authRoutes");
const purchaseReturnRouter = require("./routes/purchaseReturnRoutes");
const damagedRouter = require("./routes/damagedStockRoutes");
const excessStockRouter = require("./routes/excessStockRoutes");
const saleRouter = require("./routes/salesRoutes");




const app = express();

// middlewares
const allowedOrigins = ['http://localhost:5173','https://pharm-fontend.vercel.app']; // your frontend origin

app.use(cors({
  origin: allowedOrigins,  // allow specific origin
  credentials: true,       // allow cookies/credentials
}));
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
app.use("/api/items",itemRouter);
app.use("/api/hsn",hsnRouter);
app.use("/api/drug_Schedule",drugscheduleRouter);
app.use("/api/supplier",supplierRouter);
app.use("/api/purchase",purchaseRouter);
app.use("/api/stock",stockRouter);
app.use("/api/auth",authRouter);
app.use("/api/purchase-return",purchaseReturnRouter)
app.use('/api/damaged-stock',damagedRouter)
app.use('/api/excess-stock',excessStockRouter)
app.use('/api/sales',saleRouter)


const PORT = process.env.PORT || 5000;

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log(" Database connected");

    if (process.env.NODE_ENV === "production") {
      console.warn(" sequelize.sync() DISABLED in production.");
    } else {
      await sequelize.sync({ alter: false, force: false });
      console.log("Development: Models synchronized safely.");
    }

    startCleanupJob();

  } catch (err) {
    console.error(" Database initialization failed:", err);
    process.exit(1);
  }
}

initializeDatabase();


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

