import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./home.css";

interface Profile {
  profile_id: number;
  age_category_id: number;
  name: string;
}

interface CurrentlyWatchingItem {
  content_id: number;
  title: string;
  last_position_seconds: number;
  watched_seconds: number;
}

export default function Home() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [currentlyWatching, setCurrentlyWatching] = useState<CurrentlyWatchingItem[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const [playingContentId, setPlayingContentId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------- TIMER ----------------

  const startTimer = (startFrom: number) => {
    stopTimer();
    setElapsedSeconds(startFrom);

    timerRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ---------------- API ACTIONS ----------------

  const handlePlay = async (contentId: number) => {
    if (!activeProfile) return;

    await axios.post("http://localhost:3000/content/play", {
      profileId: activeProfile.profile_id,
      contentId,
    });

    setPlayingContentId(contentId);
    startTimer(0);
  };

  const handlePause = async (contentId: number) => {
    setPlayingContentId(null);
    stopTimer();

    await axios.post("http://localhost:3000/content/pause", {
      profileId: activeProfile.profile_id,
      contentId,
      episodeId: null,
      lastPositionSeconds: Math.floor(elapsedSeconds),
      watchedSeconds: Math.floor(elapsedSeconds),
      completed: false,
      autoContinuedNext: false,
    });
  };

  // ---------------- INIT ----------------

  useEffect(() => {
    const accountId = sessionStorage.getItem("account_id");

    // ❌ NOT LOGGED IN
    if (!accountId) {
      setNotLoggedIn(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      return;
    }

    const storedProfile = sessionStorage.getItem("activeProfile");

    // ❌ LOGGED IN BUT NO PROFILE
    if (!storedProfile) {
      navigate("/profiles");
      return;
    }

    const profile: Profile = JSON.parse(storedProfile);
    setActiveProfile(profile);

    // Continue watching
    axios
      .get(`http://localhost:3000/content/currently-watching/${profile.profile_id}`)
      .then(res => setCurrentlyWatching(res.data))
      .catch(() => setCurrentlyWatching([]));

    // Content
    axios
      .get(`http://localhost:3000/content/personalised?profileId=${profile.profile_id}`)
      .then(res => {
        const allContent: ContentItem[] = res.data;
        setMovies(allContent);
      });
  }, [navigate]);

  // ---------------- GUARDS ----------------

  if (notLoggedIn) {
    return (
      <section className="home">
        <h1>You need to log in</h1>
        <p>Redirecting to login...</p>
      </section>
    );
  }

  if (!activeProfile) return null;

  // ---------------- UI ----------------

  return (
    <section className="home">
      <h1>Welcome, {activeProfile.name}</h1>

      {/* CONTINUE WATCHING */}
      {currentlyWatching.length > 0 && (
        <>
          <h2 className="section-title">Continue Watching</h2>
          <div className="content-grid">
            {currentlyWatching.map(item => (
              <div key={item.content_id} className="content-card watching">
                <h3>{item.title}</h3>
                <p>Resume at {Math.floor(item.last_position_seconds / 60)} min</p>

                <button
                  onClick={() =>
                    playingContentId === item.content_id
                      ? handlePause(item.content_id)
                      : handleResume(item)
                  }
                >
                  {playingContentId === item.content_id ? "Pause" : "Resume"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CONTENT */}
      <h2 className="section-title">Recommended Content</h2>
      <div className="content-grid">
        {movies.map(movie => (
          <div key={movie.content_id} className="content-card">
            <h3>{movie.title}</h3>
            <p className="type">{movie.type}</p>
            {movie.description && <p>{movie.description}</p>}
            {movie.quality_name && <p>Quality: {movie.quality_name}</p>}

            {movie.type === 'SERIES' ? (
              <button onClick={() => navigate(`/series/${movie.content_id}`)}>
                View Series
              </button>
            ) : (
              <button
                onClick={() =>
                  playingContentId === movie.content_id
                    ? handlePause(movie.content_id)
                    : handlePlay(movie.content_id)
                }
              >
                {playingContentId === movie.content_id ? "Pause" : "Play"}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
