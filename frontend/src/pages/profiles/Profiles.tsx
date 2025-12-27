import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profiles.css";

interface Profile {
  profile_id: number;
  name: string;
  image_url: string | null;
  age_category: {
    age_category_id: number;
    name: string;
  };
}

const genres = [
  { id: 1, name: 'Comedy' },
  { id: 2, name: 'Action' },
  { id: 3, name: 'Drama' },
  { id: 4, name: 'Horror' },
  { id: 5, name: 'Sci-Fi' },
  { id: 6, name: 'Adventure' },
  { id: 7, name: 'Animation' },
  { id: 8, name: 'Thriller' },
];

const qualities = [
  { id: 1, name: 'SD' },
  { id: 2, name: 'HD' },
  { id: 3, name: '4K' },
];

export default function Profiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState("");
  const [ageCategory, setAgeCategory] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [minQuality, setMinQuality] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<any>(null);

  const navigate = useNavigate();

  // ✅ sessionStorage instead of localStorage
  const storedId = sessionStorage.getItem("account_id");
  const account_id = storedId ? Number(storedId) : null;

  const fetchProfiles = () => {
    if (!account_id) return;
    axios
      .get(`http://localhost:3000/account/${account_id}/profiles`)
      .then((res) => {
        setProfiles(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profiles");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!account_id) {
      setError("You are not logged in.");
      setLoading(false);
       setTimeout(() => {
        navigate("/login");
      }, 3000);
      return;
    }
   
    fetchProfiles();
  }, [account_id]);

  const handleCreate = async () => {
    setError("");
    setConsoleOutput(null);

    if (!account_id) {
      setError("You are not logged in.");
      return;
    }

    if (!name.trim()) {
      setError("Profile name is required.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/profile", {
        account_id,
        name,
        age_category_id: ageCategory,
        image_url: null,
        preferredGenres: selectedGenres,
        minQualityId: minQuality,
      });

      setConsoleOutput(res.data);

      fetchProfiles();

      setName("");
      setAgeCategory(1);
      setSelectedGenres([]);
      setMinQuality(1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create profile");
      setConsoleOutput(err.response?.data || err);
    }
  };

  return (
    <section className="profiles-page">
      <h2>Your Profiles</h2>

      {error && <p className="error-box">{error}</p>}

      {loading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        account_id && (
          <>
            <div className="profile-list">
              {profiles.map((p) => (
                <div
                  key={p.profile_id}
                  className="profile-card"
                  onClick={() => {
                    // ✅ sessionStorage
                    sessionStorage.setItem(
                      "activeProfile",
                      JSON.stringify({
                        profile_id: p.profile_id,
                        age_category_id: p.age_category.age_category_id,
                        name: p.name,
                      })
                    );

                    navigate("/home");
                  }}
                >
                  <h3>{p.name}</h3>
                  <p>Age Category: {p.age_category.name}</p>
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

            <label>Preferred Genres:</label>
            <div className="genres-checkboxes">
              {genres.map((genre) => (
                <label key={genre.id}>
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGenres([...selectedGenres, genre.id]);
                      } else {
                        setSelectedGenres(selectedGenres.filter((id) => id !== genre.id));
                      }
                    }}
                  />
                  {genre.name}
                </label>
              ))}
            </div>

            <label>Minimum Quality:</label>
            <select
              value={minQuality}
              onChange={(e) => setMinQuality(Number(e.target.value))}
            >
              {qualities.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>

            <button onClick={handleCreate}>Create Profile</button>
          </>
        )
      )}

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
