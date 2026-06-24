import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Games.css";

const API_KEY =
  import.meta.env.VITE_RAWG_API_KEY ; 
  
const BASE_URL = "https://api.rawg.io/api";

const GameSkeleton = () => (
  <div className="game-card skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-line"></div>
    <div className="skeleton-line short"></div>
  </div>
);

const GameModal = ({ game, onClose }) => {
  if (!game) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.85 }}
        >
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>

          <img
            src={game.background_image}
            alt={game.name}
            className="modal-cover"
          />

          <h2>{game.name}</h2>

          <div
            dangerouslySetInnerHTML={{
              __html: game.description || "No description available.",
            }}
          />

          <div className="modal-grid">
            <p><strong>Released:</strong> {game.released}</p>
            <p><strong>Rating:</strong> {game.rating}</p>
            <p><strong>Metacritic:</strong> {game.metacritic || "N/A"}</p>
            <p><strong>ESRB:</strong> {game.esrb_rating?.name || "N/A"}</p>

            <p>
              <strong>Developers:</strong>{" "}
              {game.developers?.map((d) => d.name).join(", ")}
            </p>

            <p>
              <strong>Publishers:</strong>{" "}
              {game.publishers?.map((p) => p.name).join(", ")}
            </p>

            <p>
              <strong>Genres:</strong>{" "}
              {game.genres?.map((g) => g.name).join(", ")}
            </p>

            <p>
              <strong>Platforms:</strong>{" "}
              {game.platforms?.map((p) => p.platform.name).join(", ")}
            </p>
          </div>

          {game.website && (
            <a
              href={game.website}
              target="_blank"
              rel="noopener noreferrer"
              className="website-btn"
            >
              Official Website
            </a>
          )}

          {game.short_screenshots?.length > 0 && (
            <div className="screenshots">
              {game.short_screenshots.map((s) => (
                <img key={s.id} src={s.image} alt="screenshot" />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function Games() {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("");

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        key: API_KEY,
        page,
        page_size: 40,
      };

      if (search) params.search = search;
      if (genre) params.genres = genre;
      if (platform) params.platforms = platform;
      if (rating) params.metacritic = `${rating},100`;

      if (year) {
        params.dates = `${year}-01-01,${year}-12-31`;
      }

      switch (sort) {
        case "az":
          params.ordering = "name";
          break;
        case "za":
          params.ordering = "-name";
          break;
        case "newest":
          params.ordering = "-released";
          break;
        case "oldest":
          params.ordering = "released";
          break;
        case "rating":
          params.ordering = "-rating";
          break;
        case "popular":
          params.ordering = "-added";
          break;
        default:
          break;
      }

      const res = await axios.get(`${BASE_URL}/games`, { params });

      setGames((prev) =>
        page === 1 ? res.data.results : [...prev, ...res.data.results]
      );
    } catch (err) {
      setError("Failed to load games.");
    } finally {
      setLoading(false);
    }
  }, [page, search, genre, platform, year, rating, sort]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [genresRes, platformsRes] = await Promise.all([
          axios.get(`${BASE_URL}/genres?key=${API_KEY}`),
          axios.get(`${BASE_URL}/platforms/lists/parents?key=${API_KEY}`)
        ]);

        setGenres(genresRes.data.results);
        setPlatforms(platformsRes.data.results);
      } catch {}
    };

    loadMeta();
  }, []);

  useEffect(() => {
    if (inView && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, loading]);

  useEffect(() => {
    setPage(1);
  }, [search, genre, platform, year, rating, sort]);

  const openGame = async (id) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/games/${id}?key=${API_KEY}`
      );

      setSelectedGame(res.data);
    } catch {}
  };

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from(
      { length: current - 1980 + 1 },
      (_, i) => current - i
    );
  }, []);

  return (
    <motion.div
      className="games-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <section className="hero">
        <div className="hero-content">
          <h1>Video Game Encyclopedia</h1>
          <p>
            Explore thousands of games from every platform and genre.
          </p>

          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <div className="filters">
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="">All Platforms</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Release Year</option>
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">Rating</option>
          <option value="80">80+</option>
          <option value="70">70+</option>
          <option value="60">60+</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="az">Name A-Z</option>
          <option value="za">Name Z-A</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="games-grid">
        {games.map((game) => (
          <motion.div
            key={game.id}
            className="game-card"
            whileHover={{ y: -8 }}
            onClick={() => openGame(game.id)}
          >
            <img
              src={game.background_image}
              alt={game.name}
            />

            <div className="card-content">
              <h3>{game.name}</h3>

              <p>Released: {game.released}</p>
              <p>⭐ {game.rating}</p>

              <p>
                {game.genres?.map((g) => g.name).join(", ")}
              </p>

              <p>
                {game.parent_platforms
                  ?.map((p) => p.platform.name)
                  .join(", ")}
              </p>

              <span>
                Metacritic: {game.metacritic || "N/A"}
              </span>
            </div>
          </motion.div>
        ))}

        {loading &&
          Array.from({ length: 12 }).map((_, i) => (
            <GameSkeleton key={i} />
          ))}
      </div>

      <div ref={ref} style={{ height: "20px" }} />

      <GameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </motion.div>
  );
}