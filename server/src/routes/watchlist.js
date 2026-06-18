import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const WATCHLIST_PATH = path.join(process.cwd(), "watchlist.json");

// GET /api/watchlist
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(WATCHLIST_PATH)) return res.json([]);
    const data = fs.readFileSync(WATCHLIST_PATH, "utf-8");
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ message: "Failed to read watchlist" });
  }
});

// POST /api/watchlist – add movie
router.post("/", (req, res) => {
  try {
    const { movieId, title, poster_path } = req.body;
    if (!movieId) return res.status(400).json({ message: "movieId required" });

    let watchlist = [];
    if (fs.existsSync(WATCHLIST_PATH)) {
      const data = fs.readFileSync(WATCHLIST_PATH, "utf-8");
      watchlist = JSON.parse(data);
    }

    // Avoid duplicates
    if (!watchlist.some((m) => m.id === movieId)) {
      watchlist.push({ id: movieId, title, poster_path });
    }

    fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(watchlist, null, 2));
    res.json(watchlist);
  } catch (e) {
    res.status(500).json({ message: "Failed to update watchlist" });
  }
});

// DELETE /api/watchlist/:id – remove movie
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    let watchlist = [];
    if (fs.existsSync(WATCHLIST_PATH)) {
      const data = fs.readFileSync(WATCHLIST_PATH, "utf-8");
      watchlist = JSON.parse(data);
    }

    watchlist = watchlist.filter((m) => m.id !== id);
    fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(watchlist, null, 2));
    res.json(watchlist);
  } catch (e) {
    res.status(500).json({ message: "Failed to update watchlist" });
  }
});

export default router;