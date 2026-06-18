import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import moviesRoutes from "./routes/movies.js";
import watchlistRoutes from "./routes/watchlist.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "Smart Movie Recommender API" }));
app.use("/api", moviesRoutes);
app.use("/api/watchlist", watchlistRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));