import { scrapeHackerNews } from "../services/scraperService.js";

export const triggerScraper = async (req, res, next) => {
  try {
    const result = await scrapeHackerNews();

    res.status(200).json({
      success: true,
      message: "Scraping completed",
      count: result.count,
      stories: result.data,
    });
  } catch (error) {
    next(error);
  }
};
