import { Routes, Route } from "react-router-dom";
console.log(import.meta.env.VITE_API_BASE_URL);
function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/login" element={<h1>Login</h1>} />
      <Route path="/register" element={<h1>Register</h1>} />
      <Route path="/bookmarks" element={<h1>Bookmarks</h1>} />
    </Routes>
  );
}

export default App;