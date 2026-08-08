import { useState } from "react";
import Logo from "../components/Logo";
import { login } from "../services/authService";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        username,
        password,
      });

      localStorage.setItem("token", result.token);

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F6F3] p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="rounded-t-2xl bg-[#51211F] p-8">
          <Logo />
        </div>

        <div className="space-y-5 p-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#772E2A] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#772E2A] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" />
              Remember me
            </label>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-[#772E2A] py-3 font-semibold text-white transition hover:bg-[#5F2421] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
