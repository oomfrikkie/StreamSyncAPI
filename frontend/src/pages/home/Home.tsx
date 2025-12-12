import { useEffect, useState } from "react";
import axios from "axios";
import './home.css'


interface Content {
  content_id: number;
  title: string;
  description: string;
  content_type: string;
  age_category_id: number;
}

export default function Home() {
  const [content, setContent] = useState<Content[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const storedProfile = localStorage.getItem("active_profile");
  const activeProfile = storedProfile ? JSON.parse(storedProfile) : null;

  useEffect(() => {
    if (!activeProfile) {
      setError("No profile selected.");
      setLoading(false);
      return;
    }

    axios
      .get(
        `http://localhost:3000/content/by-age/${activeProfile.age_category_id}`
      )
      .then((res) => {
        setContent(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load content");
        setLoading(false);
      });
  }, [activeProfile]);

  if (loading) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  return (
    <section className="home-page">
      <h2>Welcome, {activeProfile.name}</h2>

      <div className="content-grid">
        {content.map((c) => (
          <div key={c.content_id} className="content-card">
            <h3>{c.title}</h3>
            <p className="type">{c.content_type}</p>
            <p className="desc">{c.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
