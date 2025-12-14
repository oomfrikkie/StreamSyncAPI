import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./resetpassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetToken = sessionStorage.getItem("reset_token");

  // ---------------- GUARD ----------------

  useEffect(() => {
    if (!resetToken) {
      navigate("/login");
    }
  }, [resetToken, navigate]);

  // ---------------- ACTION ----------------

  const handleReset = async () => {
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await axios.post("http://localhost:3000/account/reset-password", {
        token: resetToken,
        new_password: newPassword,
      });

      // 🧹 CLEAR SESSION STORAGE
      sessionStorage.removeItem("reset_token");
      sessionStorage.removeItem("account_id");
      sessionStorage.removeItem("activeProfile");

      setSuccess("Password reset successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to reset password"
      );
    }
  };

  // ---------------- UI ----------------

  return (
    <section className="reset-password-page">

      <h2>Reset Password</h2>

      <label>New Password</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <label>Confirm New Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleReset}>
        Reset Password
      </button>

      {error && <p className="error-box">{error}</p>}
      {success && <p className="success-box">{success}</p>}

    </section>
  );
}
