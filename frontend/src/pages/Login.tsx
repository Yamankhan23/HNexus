import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import { useAuth } from "../context/AuthContext";

import type { AuthResponse } from "../types";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const { data } = await api.post<AuthResponse>(
        "/auth/login",
        formData
      );

      login(data);

      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;