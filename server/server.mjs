import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.mjs";
import bookingRoutes from "./routes/booking.routes.mjs";
import fleetRoutes from "./routes/fleet.routes.mjs";
import locationRoutes from "./routes/location.routes.mjs";
import adminRoutes from "./routes/admin.routes.mjs";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

const apiRouter = express.Router();

mongoose.connect("mongodb://127.0.0.1:27017/busBooking")
  .then(() => {
    console.log("MongoDB Connected");
}).catch(err => console.log(err));

// Wire routes
authRoutes(apiRouter);
bookingRoutes(apiRouter);
fleetRoutes(apiRouter);
locationRoutes(apiRouter);
adminRoutes(apiRouter);

app.use("/api/v1", apiRouter);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
