import axios from "axios";
import * as cheerio from "cheerio";
import Story from "../models/Story.js";

const HN_URL = "https://news.ycombinator.com";

export const scrapeHackerNews = async () => {
  try {
    const { data } = await axios.get(HN_URL);
    const $ = cheerio.load(data);

    const stories = [];

    $(".athing").each((index, element) => {
      if (index >= 10) return false; // Top 10 only

      const titleElement = $(element).find(".titleline a");
      const title = titleElement.text();
      const url = titleElement.attr("href") || null;

      const subtext = $(element).next();

      const pointsText = subtext.find(".score").text();
      const points = pointsText ? parseInt(pointsText) : 0;

      const author = subtext.find(".hnuser").text();

      let postedAt;
      
      const timeAttr = subtext.find(".age").attr("title");
      if (timeAttr && !isNaN(new Date(timeAttr))) {
        postedAt = new Date(timeAttr);
      } 
      else {
        postedAt = new Date(); // fallback
      }

      stories.push({
        title,
        url,
        points,
        author,
        postedAt,
      });
    });

    // Insert into DB (avoid duplicates)
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