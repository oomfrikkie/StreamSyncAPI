import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./account.css";

interface Account {
  account_id: number;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_timestamp: string;
}

interface Profile {
  profile_id: number;
  name: string;
  age_category: {
    name: string;
  };
}

export default function Account() {
  const navigate = useNavigate();

  const [account, setAccount] = useState<Account | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [message, setMessage] = useState("");

  const accountId = sessionStorage.getItem("account_id");

  // ---------------- INIT ----------------
console.log("ACCOUNT ID:", sessionStorage.getItem("account_id"));

  useEffect(() => {
    if (!accountId) {
      navigate("/login");
      return;
    }

    // Account details
    axios
      .get(`http://localhost:3000/account/${accountId}`)
      .then(res => setAccount(res.data))
      .catch(() => navigate("/login"));

    // Profiles
    axios
      .get(`http://localhost:3000/profile/account/${accountId}`)
      .then(res => setProfiles(res.data))
      .catch(() => setProfiles([]));
  }, [accountId, navigate]);

  // ---------------- ACTIONS ----------------

  const handlePasswordReset = async () => {
    if (!account?.email) return;

    try {
      const res = await axios.post(
        "http://localhost:3000/account/forgot-password",
        { email: account.email }
      );

      setMessage("Password reset link generated. Check console / email.");
      console.log(res.data);
    } catch {
      setMessage("Failed to request password reset");
    }
  };

  if (!account) return <p style={{ color: "white" }}>Loading account...</p>;

  // ---------------- UI ----------------

  return (
    <section className="account-page">

      {/* ACCOUNT DETAILS */}
      <section className="account-section">
        <h2>Account Details</h2>

        <p><b>Email:</b> {account.email}</p>
        <p><b>Name:</b> {account.first_name} {account.last_name}</p>
        <p><b>Status:</b> {account.status}</p>
        <p>
          <b>Created:</b>{" "}
          {new Date(account.created_timestamp).toLocaleDateString()}
        </p>

        <button onClick={handlePasswordReset}>
          Reset Password
        </button>

        {message && <p className="info-text">{message}</p>}
      </section>

      <hr />

      {/* PROFILES */}
      <section className="account-section">
        <h2>Your Profiles</h2>

        {profiles.length === 0 ? (
          <p>No profiles found</p>
        ) : (
          <div className="profile-list">
            {profiles.map(p => (
              <div key={p.profile_id} className="profile-card">
                <h3>{p.name}</h3>
                <p>Age Category: {p.age_category.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </section>
  );
}
