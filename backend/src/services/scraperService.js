import axios from "axios";
import * as cheerio from "cheerio";
import Story from "../models/Story.js";
import User from "../models/User.js";

const getRequiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }

  return value;
};

const getPositiveIntegerEnv = (key) => {
  const value = Number(getRequiredEnv(key));

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${key} must be a positive integer`);
  }

  return value;
};

const parsePostedAt = (rawPostedAt) => {
  if (!rawPostedAt) return new Date();

  const isoValue = rawPostedAt.trim().split(/\s+/)[0];
  const parsedDate = new Date(isoValue);

  return Number.isNaN(parsedDate.getTime())
    ? new Date()
    : parsedDate;
};

const normalizeUrl = (url, baseUrl) => {
  if (!url) return baseUrl;

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
};

const fetchWithRetry = async (url, config, retries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, config);
    } catch (error) {
      lastError = error;

      console.error(
        `Scrape request failed (attempt ${attempt}/${retries}):`,
        error.message
      );

      if (attempt < retries) {
        const delay = 1000 * attempt;

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export const scrapeHackerNews = async () => {
  const scrapeStartedAt = new Date();

  try {
    const hnUrl = getRequiredEnv("HN_URL");
    const hnBaseUrl = getRequiredEnv("HN_BASE_URL");
    const scrapeLimit = getPositiveIntegerEnv("HN_SCRAPE_LIMIT");
    const requestTimeoutMs = getPositiveIntegerEnv(
      "HN_REQUEST_TIMEOUT_MS"
    );
    const userAgent = getRequiredEnv("HN_USER_AGENT");

    const { data } = await fetchWithRetry(
      hnUrl,
      {
        timeout: requestTimeoutMs,
        headers: {
          "User-Agent": userAgent,
        },
      },
      3
    );

    const $ = cheerio.load(data);

    const stories = [];
    const scrapedAt = new Date();

    $(".athing").each((index, element) => {
      if (stories.length >= scrapeLimit) return false;

      const titleElement = $(element)
        .find(".titleline > a")
        .first();

      const title = titleElement.text().trim();

      const url = normalizeUrl(
        titleElement.attr("href"),
        hnBaseUrl
      );

      const hnId = $(element).attr("id");

      const rankText = $(element).find(".rank").text();

      const rank =
        parseInt(rankText.replace(/\D/g, ""), 10) ||
        index + 1;

      const subtext = $(element).next();

      const pointsText = subtext.find(".score").text();

      const points =
        parseInt(pointsText.replace(/[^0-9]/g, ""), 10) || 0;

      const author = subtext.find(".hnuser").text().trim();

      const timeAttr = subtext.find(".age").attr("title");

      const postedAt = parsePostedAt(timeAttr);

      if (!title || !author) return;

      stories.push({
        hnId,
        title,
        url,
        points,
        author,
        postedAt,
        rank,
        scrapedAt,
      });
    });

    if (stories.length === 0) {
      throw new Error("No Hacker News stories found to scrape");
    }

    await Story.bulkWrite(
      stories.map((story) => ({
        updateOne: {
          filter: story.hnId
            ? {
                $or: [
                  { hnId: story.hnId },
                  {
                    title: story.title,
                    author: story.author,
                  },
                ],
              }
            : {
                title: story.title,
                author: story.author,
              },

          update: {
            $set: {
              ...story,
              isActive: true,
            },
          },

          upsert: true,
        },
      }))
    );

    const bookmarkedStoryIds = await User.distinct("bookmarks");

    await Story.updateMany(
      {
        scrapedAt: { $lt: scrapedAt },
      },
      {
        $set: { isActive: false },
      }
    );

    await Story.deleteMany({
      scrapedAt: { $lt: scrapedAt },
      _id: { $nin: bookmarkedStoryIds },
    });

    console.log(
      `Successfully scraped ${stories.length} Hacker News stories`
    );

    return {
      success: true,
      count: stories.length,
      data: stories,
      scrapedAt,
      durationMs: Date.now() - scrapeStartedAt.getTime(),
    };
  } catch (error) {
    console.error("Hacker News scraping failed:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
};