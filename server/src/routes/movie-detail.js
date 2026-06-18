import { Router } from "express";
// This would be a separate route to handle the recommendations based on watched movies
// Instead, we'll integrate it into the existing /recommend endpoint or create a new route for clarity

// For now, we can extend the /recommend/:id endpoint to include watched movies
// or create a new route /recommend/watched/:id

// Example implementation:
const router = Router();

router.get("/recommend/watched/:id", async (req, res, next) => {
  try {
    // Get movie details
    const { id } = req.params;
    const movie = await getMovieDetails(id);

    // Get keywords from the movie
    const keywords = await getMovieKeywords(id);
    const keywordStr = keywords.keywords?.map((k) => k.name).join(" ") || "";

    if (!keywordStr) {
      // Fallback to similar movies
      const similarMovies = await getSimilar(id);
      return res.json({ movies: similarMovies.results });
    }

    // Use keywords to find similar movies
    const discretizeUrl = `https://api.themoviedb.org/3/discover/movie`;
    const params = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
      with_keywords: keywords.keywords.map((k) => k.id).join(","),
      sort_by: "popularity.desc",
    });

    const discoverRes = await fetch(`${discretizeUrl}?${params}`);
    if (!disciveres.ok) throw new Error("Discover failed");
    const data = await discoverRes.json();
    res.json({ movies: data.results });
  } catch (e) {
    next(e);
  }
});

export default router;