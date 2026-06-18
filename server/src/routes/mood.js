import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// GET /api/mood/:type
router.get("/:type", async (req, res, next) => {
  try {
    const { type } = req.params;

    // Map mood to TMDB genres
    const moodGenres = {
      happy: [35, 10749, 16], // Comedy, Romance, Animation
      sad: [18, 10752, 36],   // Drama, War, History
      thriller: [53, 80, 9648], // Thriller, Crime, Mystery
      chill: [12, 14, 10751],  // Adventure, Fantasy, Family
      "mind-blowing": [878, 9648, 53], // Sci-Fi, Mystery, Thriller
    };

    const genreIds = moodGenres[type.toLowerCase()] || [18]; // Default to Drama

    const discoverUrl = `https://api.themoviedb.org/3/discover/movie`;
    const params = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
      with_genres: genreIds.join(","),
      sort_by: "popularity.desc",
      "vote_count.gte": 100,
    });

    const response = await fetch(`${discoverUrl}?${params}`);
    if (!response.ok) throw new Error("Failed to fetch mood movies");

    const data = await response.json();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;