import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import { scrapeHackerNews } from "./services/scraperService.js";
import scraperRoutes from "./routes/scraperRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use("/api", limiter);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HNexus API is running...",
  });
});

app.use("/api", scraperRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    try {
      await scrapeHackerNews();
      console.log("Initial scrape completed");
    } catch (err) {
      console.log("Scrape failed on startup:", err.message);
    }
  });
};

startServer();
