import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is missing. Please restart the process.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text)] p-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Re-enter Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-4 py-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--primary)] text-white py-2 px-4 rounded hover:bg-[var(--primary)]/90 transition"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
