import axios from "axios";
import * as cheerio from "cheerio";
import Story from "../models/Story.js";

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

    $(".athing").each((index, element) => {
      if (index >= 10) return false;

      const titleElement = $(element).find(".titleline a");
      const title = titleElement.text().trim();
      const url = titleElement.attr("href") || "";

      const subtext = $(element).next();

      const pointsText = subtext.find(".score").text();
      const points = pointsText
        ? parseInt(pointsText.replace(/[^0-9]/g, "")) || 0
        : 0;

      const author = subtext.find(".hnuser").text() || "unknown";

      const timeAttr = subtext.find(".age").attr("title");

      const postedAt =
        timeAttr && !isNaN(Date.parse(timeAttr))
          ? new Date(timeAttr)
          : new Date();

      // basic validation (production safety)
      if (!title) return;

      stories.push({
        title,
        url,
        points,
        author,
        postedAt,
      });
    });

    // upsert (avoids duplicates + keeps fresh data)
    for (const story of stories) {
      await Story.updateOne(
        { title: story.title, author: story.author },
        { $set: story },
        { upsert: true }
      );
    }

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
