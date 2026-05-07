import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { AuthResponse } from "../types";

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const getApiError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: LoginErrors = {};
    const email = formData.email.trim();

    if (!email) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.password) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      form: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const { data } = await api.post<AuthResponse>("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      login(data);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      const message = getApiError(error, "Login failed. Please try again.");
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid min-h-[calc(100vh-120px)] items-center gap-8 lg:grid-cols-[1fr_420px]">
          <section className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#579BB1]">
              HNexus account
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-bold tracking-tight text-slate-950">
              Keep your Hacker News signal saved and synced.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              Sign in to preserve bookmarks across sessions and continue from
              the same curated story feed.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#CAE9F5] bg-white p-4">
                <p className="text-2xl font-bold text-slate-950">10</p>
                <p className="mt-1 text-sm text-slate-500">
                  stories per page
                </p>
              </div>
              <div className="rounded-2xl border border-[#CAE9F5] bg-white p-4">
                <p className="text-2xl font-bold text-slate-950">Live</p>
                <p className="mt-1 text-sm text-slate-500">
                  saved bookmark state
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#CAE9F5] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-semibold text-[#579BB1]">Login</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Access your saved stories and continue reading.
              </p>
            </div>

            {errors.form && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    errors.email
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-[#CAE9F5] focus:border-[#86C5D8] focus:ring-[#DDF3FA]"
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-[#CAE9F5] focus:border-[#86C5D8] focus:ring-[#DDF3FA]"
                  }`}
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#86C5D8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6db4ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New to HNexus?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#579BB1] hover:text-[#3f879d]"
              >
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Login;
