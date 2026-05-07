import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { Story } from "../types";

const formatPostedAt = (postedAt?: string) => {
  if (!postedAt) return "Unknown time";

  const date = new Date(postedAt);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function Bookmarks() {
  const { token } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!token) {
      setStories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get("/stories/bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStories(res.data.stories);
    } catch {
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookmarks();
  }, [fetchBookmarks]);

  const removeBookmark = async (id: string) => {
    if (!token) return toast.error("Login required");

    try {
      await api.post(
        `/stories/${id}/bookmark`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStories((current) => current.filter((story) => story._id !== id));
      toast.success("Removed from bookmarks");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F0F8FF] text-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Bookmarks
          </h1>
          <p className="text-slate-600 mb-5">
            Login to see your saved Hacker News stories.
          </p>
          <Link
            to="/login"
            className="inline-flex px-4 py-2 rounded-xl bg-[#86C5D8] text-white"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F8FF]">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-[#CAE9F5] animate-pulse"
            >
              <div className="h-4 bg-[#E0F2FE] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#E0F2FE] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight mb-8">
          Bookmarks
        </h1>

        {stories.length === 0 ? (
          <p className="text-slate-500">No bookmarked stories yet</p>
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
                <h2
                  onClick={() => window.open(story.url, "_blank")}
                  className="text-lg font-semibold cursor-pointer hover:text-[#86C5D8]"
                >
                  {story.title}
                </h2>

                <div className="flex justify-between items-end gap-4 mt-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {story.points} points by {story.author}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Posted {formatPostedAt(story.postedAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeBookmark(story._id)}
                    className="px-3 py-1 rounded-xl text-sm bg-[#86C5D8] text-white transition hover:bg-[#6db4ca]"
                  >
                    Remove
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

export default Bookmarks;
