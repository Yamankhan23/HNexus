import axios from "axios";
import * as cheerio from "cheerio";
import Story from "../models/Story.js";
import User from "../models/User.js";

const DEFAULT_SCRAPE_LIMIT = 30;
const HN_BASE_URL = "https://news.ycombinator.com/";

const getScrapeLimit = () => {
  const configuredLimit = Number(process.env.HN_SCRAPE_LIMIT);

  if (!Number.isInteger(configuredLimit) || configuredLimit < 1) {
    return DEFAULT_SCRAPE_LIMIT;
  }

  return configuredLimit;
};

const parsePostedAt = (rawPostedAt) => {
  if (!rawPostedAt) return new Date();

  const isoValue = rawPostedAt.trim().split(/\s+/)[0];
  const parsedDate = new Date(isoValue);

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

const normalizeUrl = (url) => {
  if (!url) return HN_BASE_URL;

  try {
    return new URL(url, HN_BASE_URL).toString();
  } catch {
    return url;
  }
};

export const scrapeHackerNews = async () => {
  try {
    const HN_URL = process.env.HN_URL;

    if (!HN_URL) {
      throw new Error("HN_URL is not defined in environment variables");
    }

    const { data } = await axios.get(HN_URL, {
      timeout: 10000, // production safety
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(data);

    const stories = [];
    const scrapedAt = new Date();
    const scrapeLimit = getScrapeLimit();

    $(".athing").each((index, element) => {
      if (stories.length >= scrapeLimit) return false;

      const titleElement = $(element).find(".titleline > a").first();
      const title = titleElement.text().trim();
      const url = normalizeUrl(titleElement.attr("href"));
      const hnId = $(element).attr("id");
      const rankText = $(element).find(".rank").text();
      const rank = parseInt(rankText.replace(/\D/g, ""), 10) || index + 1;

      const subtext = $(element).next();

      const pointsText = subtext.find(".score").text();
      const points = parseInt(pointsText.replace(/[^0-9]/g, ""), 10);

      const author = subtext.find(".hnuser").text().trim();

      const timeAttr = subtext.find(".age").attr("title");
      const postedAt = parsePostedAt(timeAttr);

      if (!title || !author || Number.isNaN(points)) return;

      stories.push({
        hnId,
        title,
        url,
        points,
        author,
        postedAt,
        rank,
        isActive: true,
        scrapedAt,
      });
    });

    if (stories.length === 0) {
      throw new Error("No Hacker News stories found to scrape");
    }

    await Story.updateMany({}, { $set: { isActive: false } });

    await Story.bulkWrite(
      stories.map((story) => ({
        updateOne: {
          filter: story.hnId
            ? {
                $or: [
                  { hnId: story.hnId },
                  { title: story.title, author: story.author },
                ],
              }
            : { title: story.title, author: story.author },
          update: { $set: story },
          upsert: true,
        },
      }))
    );

    const bookmarkedStoryIds = await User.distinct("bookmarks");

    await Story.deleteMany({
      isActive: false,
      _id: { $nin: bookmarkedStoryIds },
    });

    return {
      success: true,
      count: stories.length,
      data: stories,
    };
  } catch (error) {
    console.error("Scraping error:", error.message);
    throw error;
  }
};
