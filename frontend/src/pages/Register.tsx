import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import type { AuthResponse } from "../types";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const getApiError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: RegisterErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) nextErrors.name = "Name is required";
    else if (name.length < 2) nextErrors.name = "Name is too short";

    if (!email) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!formData.password) nextErrors.password = "Password is required";
    else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

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

      const { data } = await api.post<AuthResponse>("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      login(data);
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      const message = getApiError(
        error,
        "Registration failed. Please try again."
      );
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid min-h-[calc(100vh-120px)] items-center gap-8 lg:grid-cols-[420px_1fr]">
          <section className="rounded-2xl border border-[#CAE9F5] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-semibold text-[#579BB1]">Sign up</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Save stories, revisit them later, and keep your reading flow
                intact.
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
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    errors.name
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-[#CAE9F5] focus:border-[#86C5D8] focus:ring-[#DDF3FA]"
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

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

              <div className="grid gap-5 sm:grid-cols-2">
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
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-[#CAE9F5] focus:border-[#86C5D8] focus:ring-[#DDF3FA]"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#86C5D8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6db4ca] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#579BB1] hover:text-[#3f879d]"
              >
                Sign in
              </Link>
            </p>
          </section>

          <section className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#579BB1]">
              Reading workspace
            </p>
            <h2 className="mt-4 max-w-xl text-5xl font-bold tracking-tight text-slate-950">
              Build a sharper personal archive from the feed.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              Your account keeps bookmarks tied to original story records, so
              saved items remain accurate as the scraper refreshes data.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-[#CAE9F5] bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Persistent bookmarks
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Save once and revisit from any session.
                </p>
              </div>
              <div className="rounded-2xl border border-[#CAE9F5] bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Clean story metadata
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Points, author, and posted time stay visible while scanning.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Register;
