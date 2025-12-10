import { useEffect, useState } from "react";
import axios from "axios";
import "./profiles.css";

interface Profile {
  profile_id: number;
  name: string;
  age_category_id: number;
  image_url: string | null;
}

export default function Profiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState<string>("");
  const [ageCategory, setAgeCategory] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Backend console output
  const [consoleOutput, setConsoleOutput] = useState<any>(null);

  // Get logged-in account ID
  const storedId = localStorage.getItem("account_id");
  const account_id = storedId ? Number(storedId) : null;

  // Load profiles
  useEffect(() => {
    if (!account_id) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:3000/profile/account/${account_id}`)
      .then((res) => {
        setProfiles(res.data);
        setConsoleOutput(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profiles");
        setConsoleOutput(err.response?.data || err);
        setLoading(false);
      });
  }, [account_id]);

  // Create profile
  const handleCreate = async () => {
    setError("");
    if (!account_id) {
      setError("You are not logged in.");
      return;
    }

    if (!name.trim()) {
      setError("Profile name is required.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/profile/create", {
        account_id,
        name,
        age_category_id: ageCategory,
        image_url: null,
      });

      setProfiles([...profiles, res.data]);
      setConsoleOutput(res.data);

      setName("");
      setAgeCategory(1);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create profile";
      setError(msg);
      setConsoleOutput(err.response?.data || err);
    }
  };

  return (
    <section className="profiles-page">
      <h2>Your Profiles</h2>

      {/* Error message */}
      {error && <p className="error-box">{error}</p>}

      {/* If not logged in */}
      {!account_id && (
        <button style={{ marginTop: "2rem" }}>Please Log In First</button>
      )}

      {/* Loading state */}
      {loading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        account_id && (
          <>
            {/* PROFILE GRID */}
            <div className="profile-list">
              {profiles.map((p) => (
                <div key={p.profile_id} className="profile-card">
                  <h3>{p.name}</h3>
                  <p>Age Category: {p.age_category_id}</p>
                </div>
              ))}
            </div>

            <hr />

            {/* CREATE PROFILE */}
            <h3>Create New Profile</h3>

            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Age Category:</label>
            <select
              value={ageCategory}
              onChange={(e) => setAgeCategory(Number(e.target.value))}
            >
              <option value={1}>Child</option>
              <option value={2}>Teen</option>
              <option value={3}>Adult</option>
            </select>

            <button onClick={handleCreate}>Create Profile</button>
          </>
        )
      )}

      {/* BACKEND CONSOLE OUTPUT */}
      {consoleOutput && (
        <div className="console-box" style={{ marginTop: "3rem" }}>
          <h3>Backend Output</h3>
          <pre style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(consoleOutput, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
