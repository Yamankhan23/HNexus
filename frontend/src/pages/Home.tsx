import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import type { Story } from "../types";

function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    try {
      setLoading(true);

      const res = await api.get("/stories");

      setStories(res.data.stories);
    } catch (err) {
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="text-white p-10">
        Loading stories...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        Top Hacker News Stories
      </h1>

      <div className="grid gap-4">
        {stories.length === 0 ? (
          <p className="text-slate-400">
            No stories found
          </p>
        ) : (
          stories.map((story) => (
            <a
              key={story._id}
              href={story.url}
              target="_blank"
              className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <h2 className="text-lg font-semibold">
                {story.title}
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                {story.points} points • {story.author}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;