import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import api from "../api/axios";
import type { Story } from "../types";

const STORIES_PER_PAGE = 10;

const formatPostedAt = (postedAt?: string) => {
  if (!postedAt) return "Unknown time";

  const date = new Date(postedAt);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStories, setTotalStories] = useState(0);

  const { token } = useAuth();
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  // FETCH STORIES
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/stories", {
        params: {
          page,
          limit: STORIES_PER_PAGE,
        },
      });

      setStories(res.data.stories);
      setTotalPages(res.data.totalPages || 1);
      setTotalStories(res.data.totalStories || 0);
    } catch {
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStories();
  }, [fetchStories]);

  const fetchBookmarks = useCallback(async () => {
    if (!token) {
      setBookmarked(new Set());
      return;
    }

    try {
      const res = await api.get("/stories/bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ids = res.data.stories.map((story: Story) => story._id);
      setBookmarked(new Set(ids));
    } catch {
      toast.error("Failed to load bookmarks");
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookmarks();
  }, [fetchBookmarks]);

  // TOGGLE BOOKMARK (Optimistic UI)
  const toggleBookmark = async (id: string) => {
    if (!token) return toast.error("Login required");

    const updated = new Set(bookmarked);
    const isSaved = updated.has(id);

    if (isSaved) updated.delete(id);
    else updated.add(id);

    setBookmarked(updated);

    try {
      const res = await api.post(
        `/stories/${id}/bookmark`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const serverBookmarks = new Set<string>(res.data.bookmarks);
      setBookmarked(serverBookmarks);
      toast.success(
        res.data.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks"
      );
    } catch {
      setBookmarked(new Set(bookmarked));
      toast.error("Failed to update bookmark");
    }
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(
      (pageNumber) =>
        pageNumber === 1 ||
        pageNumber === totalPages ||
        Math.abs(pageNumber - page) <= 1
    );

  // LOADING STATE
  if (loading) {
  return (
    <div className="min-h-screen bg-[#F0F8FF]">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">

        {[1, 2, 3, 4].map((i) => (
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

        {/* HEADER */}
        <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight">
            Top Hacker News Stories
          </h1>

          {totalStories > 0 && (
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * STORIES_PER_PAGE + 1}-
              {Math.min(page * STORIES_PER_PAGE, totalStories)} of{" "}
              {totalStories}
            </p>
          )}
        </div>

        {/* EMPTY STATE */}
        {stories.length === 0 ? (
          <p className="text-slate-500">No stories found</p>
        ) : (
          <>
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

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#CAE9F5] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-[#CAE9F5] text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F0F8FF]"
              >
                Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {visiblePages.map((pageNumber, index) => {
                  const previousPage = visiblePages[index - 1];
                  const hasGap = previousPage && pageNumber - previousPage > 1;

                  return (
                    <div key={pageNumber} className="flex items-center gap-2">
                      {hasGap && (
                        <span className="text-sm text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => goToPage(pageNumber)}
                        className={`h-9 min-w-9 rounded-xl px-3 text-sm font-medium transition ${
                          pageNumber === page
                            ? "bg-[#86C5D8] text-white"
                            : "border border-[#CAE9F5] bg-white text-slate-700 hover:bg-[#F0F8FF]"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-[#CAE9F5] text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F0F8FF]"
              >
                Next
              </button>
            </div>
          )}
          </>
        )}

      </div>
    </div>
  );
}

export default Home;
