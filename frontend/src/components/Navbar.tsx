import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-[#CAE9F5]">
      <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* BRAND */}
        <Link
          to="/"
          className="text-xl font-bold text-[#86C5D8]"
        >
          HNexus
        </Link>

        {/* LINKS */}
        <div className="flex items-center gap-4 text-sm">

          <Link
            to="/"
            className="text-slate-700 hover:text-[#86C5D8]"
          >
            Feed
          </Link>

          <Link
            to="/bookmarks"
            className="text-slate-700 hover:text-[#86C5D8]"
          >
            Bookmarks
          </Link>

          {!token ? (
            <>
              <Link
                to="/login"
                className="text-slate-700 hover:text-[#86C5D8]"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-3 py-1 rounded-xl bg-[#86C5D8] text-white"
              >
                Sign up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
            >
              Logout
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default Navbar;