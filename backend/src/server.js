import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import connectDB from "./config/db.js";

import scraperRoutes from "./routes/scraperRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

dotenv.config({ path: new URL("./.env", import.meta.url) });

// Connect Database
connectDB();
const app = express();

// 🔐 Security Middleware
app.use(helmet());

// 🌐 CORS
app.use(cors());

// 📝 Logging (dev only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 🚦 Rate Limiting (basic protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP
  message: "Too many requests, please try again later.",
});

app.use("/api", limiter);

// 📦 Body Parser
app.use(express.json());

// 🩺 Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HNexus API is running...",
  });
});

app.use("/api", scraperRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ⚠️ Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});
