import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is missing. Go back and enter email again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      toast.success("OTP verified successfully!");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text)] p-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Enter OTP</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter the OTP sent to your email"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[var(--primary)] text-white py-2 px-4 rounded hover:bg-[var(--primary)]/90 transition"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
