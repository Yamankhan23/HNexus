import express from "express";
import { triggerScraper } from "../controllers/scraperController.js";

const router = express.Router();

router.post("/scrape", triggerScraper);

export default router;