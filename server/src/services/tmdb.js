import fetch from "node-fetch";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY is not set in .env");
}

const BASE_URL = "https://api.themoviedb.org/3";

async function tmdbGet(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.search = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...params,
  });

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.status_message || "TMDB request failed");
  }
  return res.json();
}

export const searchMovies = (query) => tmdbGet("/search/movie", { query });
export const getMovieDetails = (id) => tmdbGet(`/movie/${id}`);
export const getTrending = () => tmdbGet("/trending/movie/week");
export const getSimilar = (id) => tmdbGet(`/movie/${id}/similar`);
export const getMovieKeywords = (id) => tmdbGet(`/movie/${id}/keywords`);