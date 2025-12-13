import { useEffect, useState } from "react";
import axios from "axios";
import "./home.css";

interface Profile {
  profile_id: number;
  age_category_id: number;
  name: string;
}

interface ContentItem {
  content_id: number;
  title: string;
  description: string;
  content_type: "MOVIE" | "EPISODE";
}

interface CurrentlyWatchingItem {
  content_id: number;
  title: string;
  last_position_seconds: number;
  watched_seconds: number;
}

interface SeriesItem {
  name: string;
}

export default function Home() {
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [currentlyWatching, setCurrentlyWatching] = useState<CurrentlyWatchingItem[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem("activeProfile");
    if (!storedProfile) return;

    const profile: Profile = JSON.parse(storedProfile);
    setActiveProfile(profile);

    // ▶️ Continue Watching
    axios
      .get(`http://localhost:3000/content/currently-watching/${profile.profile_id}`)
      .then((res) => setCurrentlyWatching(res.data))
      .catch(() => setCurrentlyWatching([]));

    // 🎬 Content by age
    axios
      .get(`http://localhost:3000/content/by-age/${profile.age_category_id}`)
      .then((res) => {
        const allContent: ContentItem[] = res.data;

        // Movies
        setMovies(allContent.filter(c => c.content_type === "MOVIE"));

        // Series (deduced from episode titles)
        const seriesSet = new Set<string>();

        allContent
          .filter(c => c.content_type === "EPISODE")
          .forEach(ep => {
            // crude but works with your data: "Space Adventures S1E1"
            const seriesName = ep.title.split(" S")[0];
            seriesSet.add(seriesName);
          });

        setSeries([...seriesSet].map(name => ({ name })));
      });
  }, []);

  if (!activeProfile) {
    return <p>No profile selected</p>;
  }

  return (
    <section className="home">
      <h1>Welcome, {activeProfile.name}</h1>

      {/* ▶️ CONTINUE WATCHING */}
      {currentlyWatching.length > 0 && (
        <>
          <h2 className="section-title">Continue Watching</h2>
          <div className="content-grid">
            {currentlyWatching.map(item => (
              <div key={item.content_id} className="content-card watching">
                <h3>{item.title}</h3>
                <p>
                  Resume at {Math.floor(item.last_position_seconds / 60)} min
                </p>
                <button>Continue</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 📺 SERIES */}
      {series.length > 0 && (
        <>
          <h2 className="section-title">Series</h2>
          <div className="content-grid">
            {series.map(s => (
              <div key={s.name} className="content-card">
                <h3>{s.name}</h3>
                <button>View Series</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🎥 MOVIES */}
      <h2 className="section-title">Movies</h2>
      <div className="content-grid">
        {movies.map(movie => (
          <div key={movie.content_id} className="content-card">
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
            <button>Play</button>
          </div>
        ))}
      </div>
    </section>
  );
}
