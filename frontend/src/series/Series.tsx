import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./series.css";

interface Profile {
  profile_id: number;
  age_category_id: number;
  name: string;
}

interface EpisodeItem {
  content_id: number;
  title: string;
  episode_number: number;
  duration_minutes: number;
  season_number: number;
  last_position_seconds?: number;
}

export default function Series() {
  const { seriesId } = useParams<{ seriesId: string }>();

  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [seriesName, setSeriesName] = useState("");
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const [playingContentId, setPlayingContentId] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = (startFrom: number) => {
    stopTimer();
    setElapsedSeconds(startFrom);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(p => p + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

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
    if (!activeProfile) return;
    setPlayingContentId(null);
    stopTimer();
    await axios.post("http://localhost:3000/content/pause", {
      profileId: activeProfile.profile_id,
      contentId,
      lastPositionSeconds: elapsedSeconds,
      watchedSeconds: elapsedSeconds,
      completed: false,
      autoContinuedNext: false,
    });
  };

  const handleResume = async (ep: EpisodeItem) => {
    if (!activeProfile) return;
    setPlayingContentId(ep.content_id);
    startTimer(ep.last_position_seconds ?? 0);
  };

  useEffect(() => {
    const storedProfile = sessionStorage.getItem("activeProfile");
    if (!storedProfile || !seriesId) return;

    setActiveProfile(JSON.parse(storedProfile));

    axios
      .get(`http://localhost:3000/series/${seriesId}`)
      .then(res => setSeriesName(res.data.name));

    axios
      .get(`http://localhost:3000/series/${seriesId}/episodes`)
      .then(res => setEpisodes(res.data));

      axios
  .get(`http://localhost:3000/series/${seriesId}`)
  .then(res => setSeriesName(res.data.name));

  }, [seriesId]);

  if (!activeProfile) return <p>No profile selected</p>;

  // 🔑 GROUP BY SEASON
  const episodesBySeason = episodes.reduce<Record<number, EpisodeItem[]>>(
    (acc, ep) => {
      acc[ep.season_number] ??= [];
      acc[ep.season_number].push(ep);
      return acc;
    },
    {}
  );

  return (
    <section className="series-page">
      <h1 className="series-title">{seriesName}</h1>

      {Object.entries(episodesBySeason).map(([season, eps]) => (
        <div key={season} className="season-block">
          <h2 className="season-title">Season {season}</h2>

          <div className="season-row">
            {eps.map(ep => {
              const isPlaying = playingContentId === ep.content_id;
              const hasProgress = (ep.last_position_seconds ?? 0) > 0;

              return (
                <div key={ep.content_id} className="episode-card">
                  <h3>
                    Ep {ep.episode_number}: {ep.title}
                  </h3>

                  <p>{ep.duration_minutes} min</p>

                  <button
                    onClick={() =>
                      isPlaying
                        ? handlePause(ep.content_id)
                        : hasProgress
                        ? handleResume(ep)
                        : handlePlay(ep.content_id)
                    }
                  >
                    {isPlaying ? "Pause" : hasProgress ? "Resume" : "Play"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
