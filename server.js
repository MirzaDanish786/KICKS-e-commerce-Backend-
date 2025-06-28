import express, { json } from "express";
import cors from "cors";
import dotevn from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoute from './routes/authRoute.js'
import categoryRoute from './routes/categoryRoute.js'
import productRoute from './routes/productRoute.js'
import connectDB from "./config/db.js";
dotevn.config();

const app = express();
const port = process.env.PORT;
connectDB(); 

await mongoose.connect('mongodb://127.0.0.1:27017/KICKS');

// Middlewares:
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));
app.use(express.json())
app.use(cors({
  origin: "http://localhost:5173",   
  credentials: true,
}));
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
