require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const pool    = require("./db/pool");

const authRoutes       = require("./routes/auth");
const baggageRoutes    = require("./routes/baggage");
const usersRoutes      = require("./routes/users");
const lostReportRoutes = require("./routes/lostReports");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.use(express.json());

// ── In-Memory Telemetry State ───────────────────────────────
const healthHistory = {
  cpu: Array.from({ length: 20 }, () => Math.floor(Math.random() * 30) + 20),
  memory: Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 45),
  storage: Array.from({ length: 20 }, () => Math.floor(Math.random() * 2) + 48),
  network: Array.from({ length: 20 }, () => Math.floor(Math.random() * 100) + 150),
};

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    const fluctuate = (val, min, max) => {
      const change = Math.floor(Math.random() * 5) - 2;
      return Math.min(max, Math.max(min, val + change));
    };

    const nextCpu = fluctuate(healthHistory.cpu[healthHistory.cpu.length - 1], 10, 95);
    healthHistory.cpu.push(nextCpu);
    healthHistory.cpu.shift();

    const nextMemory = fluctuate(healthHistory.memory[healthHistory.memory.length - 1], 40, 90);
    healthHistory.memory.push(nextMemory);
    healthHistory.memory.shift();

    const nextStorage = fluctuate(healthHistory.storage[healthHistory.storage.length - 1], 30, 80);
    healthHistory.storage.push(nextStorage);
    healthHistory.storage.shift();

    const nextNetwork = fluctuate(healthHistory.network[healthHistory.network.length - 1], 50, 400);
    healthHistory.network.push(nextNetwork);
    healthHistory.network.shift();

    res.json({
      status: "ok",
      db: "connected",
      cpu: { current: nextCpu, history: healthHistory.cpu },
      memory: { current: nextMemory, history: healthHistory.memory },
      storage: { current: nextStorage, history: healthHistory.storage },
      network: { current: nextNetwork, history: healthHistory.network },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[health check]", err.message);
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

// ── Notifications (quick read from DB) ───────────────────────
app.get("/api/notifications", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, type, message, timestamp FROM notifications ORDER BY created_at DESC LIMIT 10"
    );
    res.json(rows);
  } catch (err) {
    console.error("[notifications]", err.message);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// ── Activity Log ──────────────────────────────────────────────
app.get("/api/activity", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, action, details, username AS user, time
       FROM activity_log ORDER BY created_at DESC LIMIT 15`
    );
    res.json(rows);
  } catch (err) {
    console.error("[activity]", err.message);
    res.status(500).json({ error: "Failed to fetch activity." });
  }
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/baggage",      baggageRoutes);
app.use("/api/users",        usersRoutes);
app.use("/api/lost-reports", lostReportRoutes);

// ── 404 fallback ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── Start Server ──────────────────────────────────────────────
const startServer = async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query("SELECT 1");
      console.log("[DB] PostgreSQL connected ✓");
      break;
    } catch (err) {
      retries--;
      console.warn(`[DB] Waiting for PostgreSQL... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (retries === 0) {
    console.error("[DB] Could not connect to PostgreSQL. Exiting.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[API] LuggageTrack backend running on port ${PORT}`);
  });
};

startServer();
