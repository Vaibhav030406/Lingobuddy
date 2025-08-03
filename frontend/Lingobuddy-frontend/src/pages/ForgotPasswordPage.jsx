import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace this with actual API call
      const res = await fetch("http://localhost:5001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      toast.success("OTP sent to your email");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text)] p-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-4 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[var(--primary)] text-white py-2 px-4 rounded hover:bg-[var(--primary)]/90 transition"
        >
          Send OTP
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
