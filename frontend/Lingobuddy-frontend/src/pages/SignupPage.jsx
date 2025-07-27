import { useState } from "react";
import { Dessert } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api';
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();
  const { mutate: signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Signup successful!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to signup. Please try again.");
    },
  });

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white text-gray-800">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white border border-blue-200 rounded-xl shadow-lg overflow-hidden">

        {/* FORM */}
        <div className="w-full lg:w-1/2 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Dessert className="size-10 text-blue-500 animate-spin-slow" />
            <span className="text-3xl font-bold font-mono text-blue-500">LingoBuddy</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded">
              <span>{error.response?.data?.message}</span>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-2">Create an Account</h2>
          <p className="text-sm text-gray-600 mb-6">Join and start learning together!</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-400"
              value={signupData.fullName}
              onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-400"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 focus:ring-2 focus:ring-blue-400"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              required
            />
            <button
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-transform duration-200 hover:scale-105"
              type="submit"
            >
              {isPending ? "Signing up..." : "Create Account"}
            </button>
            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">Sign in</Link>
            </p>
          </form>
        </div>

        {/* ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-blue-50 items-center justify-center">
          <div className="p-10 max-w-md">
            <img src="/signup.png" alt="Signup" className="w-full rounded" />
            <h2 className="text-xl font-semibold mt-6 text-center">Learn with the world</h2>
            <p className="text-sm text-gray-600 text-center">Make friends while mastering new languages.</p>
          </div>
        </div>
      </div>

      {/* Custom animation */}
      <style jsx="true">{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;
