const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "change-me-now";
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data", "leaderboard.json");

const emptyState = {
  updatedAt: null,
  source: null,
  serverName: "Minecraft Server",
  onlineCount: 0,
  leaders: {
    money: [],
    shards: []
  }
};

function ensureDataDir() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

function normalizeIncoming(body) {
  const leaders = body?.leaders || {};
  const money = Array.isArray(leaders.money) ? leaders.money : Array.isArray(body?.money) ? body.money : [];
  const shards = Array.isArray(leaders.shards) ? leaders.shards : Array.isArray(body?.shards) ? body.shards : [];

  const normalizeRows = (rows) =>
    rows
      .filter((row) => row && typeof row.name === "string")
      .map((row, index) => ({
        rank: Number.isFinite(row.rank) ? row.rank : index + 1,
        name: String(row.name).slice(0, 40),
        value: Number(row.value || 0),
        displayValue: row.displayValue ? String(row.displayValue).slice(0, 40) : null
      }))
      .slice(0, 10);

  return {
    updatedAt: body?.updatedAt || new Date().toISOString(),
    source: body?.source || "minecraft",
    serverName: body?.serverName || "Minecraft Server",
    onlineCount: Number(body?.onlineCount || 0),
    leaders: {
      money: normalizeRows(money),
      shards: normalizeRows(shards)
    }
  };
}

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return emptyState;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...emptyState,
      ...parsed,
      leaders: {
        money: Array.isArray(parsed?.leaders?.money) ? parsed.leaders.money : [],
        shards: Array.isArray(parsed?.leaders?.shards) ? parsed.leaders.shards : []
      }
    };
  } catch {
    return emptyState;
  }
}

function writeData(state) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

app.use(cors());
app.use(express.json({ limit: "64kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/leaderboard", (req, res) => {
  res.json(readData());
});

app.post("/api/update", (req, res) => {
  const token = req.header("x-api-key") || req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== API_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const incoming = normalizeIncoming(req.body || {});
  const safeState = {
    ...readData(),
    ...incoming
  };

  writeData(safeState);
  res.json({ ok: true, saved: true, updatedAt: safeState.updatedAt });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Leaderboard site running on http://localhost:${PORT}`);
  console.log(`API key: ${API_KEY}`);
  console.log(`Data file: ${DATA_FILE}`);
});
