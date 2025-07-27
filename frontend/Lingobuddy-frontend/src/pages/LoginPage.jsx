import { useState } from "react";
import { Dessert } from "lucide-react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="h-screen flex items-center justify-center p-8 bg-blue-900 text-gray-800 transition-all duration-500">
      <div className="border border-blue-200 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-blue-200 rounded-xl shadow-lg overflow-hidden">
        
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col">
          <div className="mb-6 flex items-center gap-2">
            <Dessert className="size-9 text-blue-500 animate-spin-slow" />
            <span className="text-3xl font-bold font-mono text-blue-500">LingoBuddy</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded">
              <span>{error.response?.data?.message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Welcome Back</h2>
              <p className="text-sm text-gray-600">Sign in to your account</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 p-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-transform duration-200 hover:scale-105"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
              <p className="text-center text-sm mt-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-500 hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* ILLUSTRATION SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-blue-500 items-center justify-center">
          <div className="max-w-md p-8">
            <img src="/login.png" alt="Illustration" className="w-full h-auto rounded" />
            <div className="text-center mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners</h2>
              <p className="text-gray-600">Practice conversations and grow together.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom slow spin animation */}
      <style jsx="true">{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
