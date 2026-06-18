import { Router } from "express";
import {
  searchMovies,
  getMovieDetails,
  getTrending,
  getSimilar,
  getMovieKeywords,
} from "../services/tmdb.js";
import { askOpenAI } from "../services/openai.js";
import fs from "fs";

const router = Router();

/** GET /api/search?query=... */
router.get("/search", async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "query required" });
    const data = await searchMovies(query);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** GET /api/movie/:id */
router.get("/movie/:id", async (req, res, next) => {
  try {
    const data = await getMovieDetails(req.params.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** GET /api/recommend/:id – similar movies */
router.get("/recommend/:id", async (req, res, next) => {
  try {
    const data = await getSimilar(req.params.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** GET /api/trending */
router.get("/trending", async (_req, res, next) => {
  try {
    const data = await getTrending();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** POST /api/ai-recommend – AI-based recommendations */
router.post("/ai-recommend", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "prompt required" });

    // Ask OpenAI to generate a list of movie recommendations
    const aiResponse = await askOpenAI(
      `Based on this request: "${prompt}", suggest 5 movies. Return ONLY the movie titles, one per line, no other text.`
    );

    // Parse titles and search TMDB for each
    const titles = aiResponse.split("\n").filter(Boolean).slice(0, 5);
    const results = await Promise.all(
      titles.map(async (title) => {
        const search = await searchMovies(title);
        return search.results[0] || null;
      })
    );

    res.json({ recommendations: results.filter(Boolean) });
  } catch (e) {
    next(e);
  }
});

/** GET /api/because-watched/:id – recommendations based on watched movies */
router.get("/because-watched/:id", async (req, res, next) => {
  try {
    const keywords = await getMovieKeywords(req.params.id);
    const keywordStr = keywords.keywords?.map((k) => k.name).join(" ") || "";

    if (!keywordStr) {
      // Fallback to similar movies if no keywords available
      const data = await getSimilar(req.params.id);
      return res.json({ movies: data.results });
    }

    // Discover movies using the same keywords
    const discoverUrl = `https://api.themoviedb.org/3/discover/movie`;
    const params = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY,
      language: "en-US",
      with_keywords: keywords.keywords.map((k) => k.id).join(","),
      sort_by: "popularity.desc",
    });

    const discoverRes = await fetch(`${discoverUrl}?${params}`);
    if (!discoverRes.ok) throw new Error("Discover failed");
    const data = await discoverRes.json();
    res.json({ movies: data.results });
  } catch (e) {
    next(e);
  }
});

export default router;