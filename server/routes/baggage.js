const express = require("express");
const router  = express.Router();
const pool    = require("../db/pool");
const { authenticate } = require("../middleware/auth");

// All baggage routes require a valid JWT
router.use(authenticate);

// GET /api/baggage
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, passenger_name AS "passengerName", flight_number AS "flightNumber",
              origin, destination, status, weight, pnr, notes,
              last_updated AS "lastUpdated", created_at AS "createdAt"
       FROM baggage ORDER BY last_updated DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("[baggage GET /]", err.message);
    res.status(500).json({ error: "Failed to fetch baggage records." });
  }
});

// GET /api/baggage/track?q=<query>
router.get("/track", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Query parameter q is required." });

  try {
    // PNR match
    const pnrMatch = q.match(/PNR[:\s-]+([A-Z0-9]+)/i);
    if (pnrMatch) {
      const { rows } = await pool.query(
        `SELECT id, passenger_name AS "passengerName", flight_number AS "flightNumber",
                origin, destination, status, weight, pnr, notes,
                last_updated AS "lastUpdated"
         FROM baggage WHERE UPPER(pnr) = $1 LIMIT 1`,
        [pnrMatch[1].toUpperCase()]
      );
      if (rows.length > 0) return res.json(rows[0]);
    }

    const { rows } = await pool.query(
      `SELECT id, passenger_name AS "passengerName", flight_number AS "flightNumber",
              origin, destination, status, weight, pnr, notes,
              last_updated AS "lastUpdated"
       FROM baggage
       WHERE LOWER(id) = LOWER($1)
          OR LOWER(passenger_name) LIKE LOWER($2)
          OR LOWER(REPLACE(flight_number,'-','')) = LOWER(REPLACE($1,'-',''))
       LIMIT 1`,
      [q, `%${q}%`]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No baggage found matching this query." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[baggage GET /track]", err.message);
    res.status(500).json({ error: "Tracking lookup failed." });
  }
});

// GET /api/baggage/:id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, passenger_name AS "passengerName", flight_number AS "flightNumber",
              origin, destination, status, weight, pnr, notes,
              last_updated AS "lastUpdated"
       FROM baggage WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Baggage record not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("[baggage GET /:id]", err.message);
    res.status(500).json({ error: "Failed to fetch record." });
  }
});

// POST /api/baggage
router.post("/", async (req, res) => {
  const { id, passengerName, flightNumber, origin, destination, status, weight, pnr, notes } = req.body;
  if (!id || !passengerName || !flightNumber || !origin || !destination) {
    return res.status(400).json({ error: "Required fields missing." });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO baggage (id, passenger_name, flight_number, origin, destination, status, weight, pnr, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, passenger_name AS "passengerName", flight_number AS "flightNumber",
                 origin, destination, status, weight, pnr, notes, last_updated AS "lastUpdated"`,
      [id, passengerName, flightNumber, origin, destination, status || "Checked In", weight || null, pnr || null, notes || null]
    );

    // log activity
    await pool.query(
      `INSERT INTO activity_log (action, details, username, time)
       VALUES ('Record Created', $1, $2, 'Just now')`,
      [`Added ${id} for ${passengerName}`, req.user.username]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Baggage ID already exists." });
    console.error("[baggage POST /]", err.message);
    res.status(500).json({ error: "Failed to create record." });
  }
});

// PUT /api/baggage/:id
router.put("/:id", async (req, res) => {
  const { passengerName, flightNumber, origin, destination, status, weight, pnr, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE baggage SET
         passenger_name = COALESCE($1, passenger_name),
         flight_number  = COALESCE($2, flight_number),
         origin         = COALESCE($3, origin),
         destination    = COALESCE($4, destination),
         status         = COALESCE($5, status),
         weight         = COALESCE($6, weight),
         pnr            = COALESCE($7, pnr),
         notes          = COALESCE($8, notes),
         last_updated   = NOW()
       WHERE id = $9
       RETURNING id, passenger_name AS "passengerName", flight_number AS "flightNumber",
                 origin, destination, status, weight, pnr, notes, last_updated AS "lastUpdated"`,
      [passengerName, flightNumber, origin, destination, status, weight, pnr, notes, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Baggage record not found." });

    // log status change
    if (status) {
      await pool.query(
        `INSERT INTO activity_log (action, details, username, time)
         VALUES ('Status Updated', $1, $2, 'Just now')`,
        [`${req.params.id} updated to '${status}'`, req.user.username]
      );
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("[baggage PUT /:id]", err.message);
    res.status(500).json({ error: "Failed to update record." });
  }
});

// DELETE /api/baggage/:id
router.delete("/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM baggage WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: "Baggage record not found." });

    await pool.query(
      `INSERT INTO activity_log (action, details, username, time)
       VALUES ('Record Deleted', $1, $2, 'Just now')`,
      [`Removed baggage ${req.params.id}`, req.user.username]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("[baggage DELETE /:id]", err.message);
    res.status(500).json({ error: "Failed to delete record." });
  }
});

module.exports = router;
