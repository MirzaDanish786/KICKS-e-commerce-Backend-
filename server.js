import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoute from "./routes/productRoute.js";
import reviewsRoute from './routes/reviewsRoute.js'
import connectDB from "./config/db.js";
import { responseMiddleware } from "./middlewares/responseMiddleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";
dotenv.config();


const app = express();
const port = process.env.PORT || 5000;
connectDB();

// Middlewares:
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(responseMiddleware)

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use('/api/reviews', reviewsRoute)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
