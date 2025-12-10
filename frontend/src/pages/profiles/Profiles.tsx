import { useEffect, useState } from "react";
import axios from "axios";


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

  // account_id can be null → TypeScript forces correct type
  const storedId = localStorage.getItem("account_id");
  const account_id = storedId ? Number(storedId) : null;

  useEffect(() => {
    if (!account_id) {
      setError("No account logged in.");
      setLoading(false);
      return;
    }

    axios
      .get<Profile[]>(`http://localhost:3000/profile/account/${account_id}`)
      .then((res) => {
        setProfiles(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profiles");
        setLoading(false);
      });
  }, [account_id]);

  const handleCreate = async () => {
    if (!account_id) {
      setError("No account logged in.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      const res = await axios.post<Profile>("http://localhost:3000/profile/create", {
        account_id,
        name,
        age_category_id: ageCategory,
        image_url: null
      });

      setProfiles([...profiles, res.data]);
      setName("");
      setAgeCategory(1);
      setError("");

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create profile");
    }
  };

  return (
    <section className="profiles-page">
      <h2>Your Profiles</h2>

      {error && <p className="error-box">{error}</p>}

      {loading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        <>
          <div className="profile-list">
            {profiles.map((p) => (
              <div key={p.profile_id} className="profile-card">
                <h3>{p.name}</h3>
                <p>Age Category: {p.age_category_id}</p>
              </div>
            ))}
          </div>

          <hr />

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
      )}
    </section>
  );
}
