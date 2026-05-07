import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import api from "../api/axios";
import type { Story } from "../types";

function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  // FETCH STORIES
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

  // TOGGLE BOOKMARK (Optimistic UI)
  const toggleBookmark = async (id: string) => {
    if (!token) return toast.error("Login required");

    const updated = new Set(bookmarked);
    const isSaved = updated.has(id);

    if (isSaved) updated.delete(id);
    else updated.add(id);

    setBookmarked(updated);

    try {
      await api.post(
        `/stories/${id}/bookmark`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(isSaved ? "Removed from bookmarks" : "Saved to bookmarks");
    } catch (err) {
      setBookmarked(new Set(bookmarked));
      toast.error("Failed to update bookmark");
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F8FF] flex items-center justify-center text-slate-500">
        Loading stories...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* HEADER */}
        <h1 className="text-4xl font-bold tracking-tight mb-8">
          Top Hacker News Stories
        </h1>

        {/* EMPTY STATE */}
        {stories.length === 0 ? (
          <p className="text-slate-500">No stories found</p>
        ) : (
          <div className="space-y-4">

            {stories.map((story) => (
              <div
                key={story._id}
                className="
                  p-5 rounded-2xl
                  bg-white
                  border border-[#CAE9F5]
                  hover:shadow-md
                  hover:bg-[#F0F8FF]
                  transition-all duration-200
                "
              >
                {/* TITLE (clickable) */}
                <h2
                  onClick={() => window.open(story.url, "_blank")}
                  className="text-lg font-semibold cursor-pointer hover:text-[#86C5D8]"
                >
                  {story.title}
                </h2>

                {/* FOOTER */}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm text-slate-500">
                    {story.points} points • {story.author}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(story._id);
                    }}
                    className={`
                      px-3 py-1 rounded-xl text-sm transition
                      ${
                        bookmarked.has(story._id)
                          ? "bg-[#86C5D8] text-white"
                          : "bg-white border border-[#CAE9F5] text-slate-700"
                      }
                    `}
                  >
                    {bookmarked.has(story._id) ? "Saved" : "Save"}
                  </button>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Home;