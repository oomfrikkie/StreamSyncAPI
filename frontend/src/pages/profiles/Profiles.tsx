import { useEffect, useState } from "react";
import axios from "axios";
import "./profiles.css";

interface Profile {
  profile_id: number;
  name: string;
<<<<<<< HEAD
  age_category_id: number;
  image_url: string | null;
=======
  image_url: string | null;
  age_category: {
    age_category_id: number;
    name: string;
  };
>>>>>>> origin/accountbranch
}

export default function Profiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState<string>("");
  const [ageCategory, setAgeCategory] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

<<<<<<< HEAD
  // Backend console output
  const [consoleOutput, setConsoleOutput] = useState<any>(null);

  // Get logged-in account ID
  const storedId = localStorage.getItem("account_id");
  const account_id = storedId ? Number(storedId) : null;

  // Load profiles
=======
  // Only for create profile responses
  const [consoleOutput, setConsoleOutput] = useState<any>(null);

  const storedId = localStorage.getItem("account_id");
  const account_id = storedId ? Number(storedId) : null;

>>>>>>> origin/accountbranch
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
<<<<<<< HEAD
        setConsoleOutput(res.data);
=======
>>>>>>> origin/accountbranch
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profiles");
<<<<<<< HEAD
        setConsoleOutput(err.response?.data || err);
=======
>>>>>>> origin/accountbranch
        setLoading(false);
      });
  }, [account_id]);

<<<<<<< HEAD
  // Create profile
  const handleCreate = async () => {
    setError("");
=======
  const handleCreate = async () => {
    setError("");
    setConsoleOutput(null);

>>>>>>> origin/accountbranch
    if (!account_id) {
      setError("You are not logged in.");
      return;
    }

    if (!name.trim()) {
      setError("Profile name is required.");
      return;
    }

    try {
<<<<<<< HEAD
      const res = await axios.post("http://localhost:3000/profile/create", {
=======
      const res = await axios.post("http://localhost:3000/profile", {
>>>>>>> origin/accountbranch
        account_id,
        name,
        age_category_id: ageCategory,
        image_url: null,
      });

<<<<<<< HEAD
      setProfiles([...profiles, res.data]);
      setConsoleOutput(res.data);

=======
      // New profile into list
      setProfiles([...profiles, res.data]);

      // Only show this output — creation response
      setConsoleOutput(res.data);

      // Reset input
>>>>>>> origin/accountbranch
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

<<<<<<< HEAD
      {/* Error message */}
      {error && <p className="error-box">{error}</p>}

      {/* If not logged in */}
=======
      {error && <p className="error-box">{error}</p>}

>>>>>>> origin/accountbranch
      {!account_id && (
        <button style={{ marginTop: "2rem" }}>Please Log In First</button>
      )}

<<<<<<< HEAD
      {/* Loading state */}
=======
>>>>>>> origin/accountbranch
      {loading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        account_id && (
          <>
<<<<<<< HEAD
            {/* PROFILE GRID */}
=======
>>>>>>> origin/accountbranch
            <div className="profile-list">
              {profiles.map((p) => (
                <div key={p.profile_id} className="profile-card">
                  <h3>{p.name}</h3>
<<<<<<< HEAD
                  <p>Age Category: {p.age_category_id}</p>
=======
                  <p>Age Category: {p.age_category.name}</p>
>>>>>>> origin/accountbranch
                </div>
              ))}
            </div>

            <hr />

<<<<<<< HEAD
            {/* CREATE PROFILE */}
=======
>>>>>>> origin/accountbranch
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

<<<<<<< HEAD
      {/* BACKEND CONSOLE OUTPUT */}
=======
      {/* ONLY show backend output after create */}
>>>>>>> origin/accountbranch
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
