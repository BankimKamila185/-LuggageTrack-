const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.POSTGRES_HOST     || "postgres",
  port:     parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB       || "luggagetrack",
  user:     process.env.POSTGRES_USER     || "luggagetrack",
  password: process.env.POSTGRES_PASSWORD || "luggagetrack123",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

module.exports = pool;
