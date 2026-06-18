const express = require("express");
const router  = express.Router();
const pool    = require("../db/pool");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

// GET /api/lost-reports
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, bag_id AS "bagId", passenger_name AS "passengerName",
              contact_email AS "contactEmail", contact_phone AS "contactPhone",
              flight, route, last_seen_location AS "lastSeenLocation",
              description, status, assigned_to AS "assignedTo",
              reported_at AS "reportedAt", updated_at AS "updatedAt"
       FROM lost_reports ORDER BY reported_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("[lost-reports GET /]", err.message);
    res.status(500).json({ error: "Failed to fetch reports." });
  }
});

// POST /api/lost-reports
router.post("/", async (req, res) => {
  const { passengerName, contactEmail, contactPhone, bagId, flight, route, lastSeenLocation, description } = req.body;
  if (!passengerName || !contactEmail || !flight || !description) {
    return res.status(400).json({ error: "Required fields missing." });
  }
  try {
    const newId = `LR-${String(Date.now()).slice(-6)}`;
    const { rows } = await pool.query(
      `INSERT INTO lost_reports (id, bag_id, passenger_name, contact_email, contact_phone, flight, route, last_seen_location, description, status, assigned_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Pending Review','Unassigned')
       RETURNING id, bag_id AS "bagId", passenger_name AS "passengerName",
                 contact_email AS "contactEmail", contact_phone AS "contactPhone",
                 flight, route, last_seen_location AS "lastSeenLocation",
                 description, status, assigned_to AS "assignedTo", reported_at AS "reportedAt"`,
      [newId, bagId || null, passengerName, contactEmail, contactPhone || null, flight, route || null, lastSeenLocation || null, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[lost-reports POST /]", err.message);
    res.status(500).json({ error: "Failed to file report." });
  }
});

// PUT /api/lost-reports/:id  (update status / assignee)
router.put("/:id", async (req, res) => {
  const { status, assignedTo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE lost_reports SET
         status      = COALESCE($1, status),
         assigned_to = COALESCE($2, assigned_to),
         updated_at  = NOW()
       WHERE id = $3
       RETURNING id, status, assigned_to AS "assignedTo", updated_at AS "updatedAt"`,
      [status, assignedTo, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Report not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("[lost-reports PUT /:id]", err.message);
    res.status(500).json({ error: "Failed to update report." });
  }
});

module.exports = router;
