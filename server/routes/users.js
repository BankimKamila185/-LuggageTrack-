const express = require("express");
const router  = express.Router();
const pool    = require("../db/pool");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.use(authenticate);

// GET /api/users
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, username, role, status, created_at AS "createdAt"
       FROM users ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    console.error("[users GET /]", err.message);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// POST /api/users
router.post("/", requireAdmin, async (req, res) => {
  const { name, email, username, role, status } = req.body;
  if (!name || !email || !username || !role) {
    return res.status(400).json({ error: "Name, email, username, and role are required." });
  }
  try {
    const bcrypt = require("bcryptjs");
    const defaultPassword = await bcrypt.hash("admin123", 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, username, password, role, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, username, role, status`,
      [name, email, username.toLowerCase(), defaultPassword, role, status || "Active"]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email or username already exists." });
    console.error("[users POST /]", err.message);
    res.status(500).json({ error: "Failed to create user." });
  }
});

// PUT /api/users/:id
router.put("/:id", requireAdmin, async (req, res) => {
  const { name, email, role, status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users SET
         name   = COALESCE($1, name),
         email  = COALESCE($2, email),
         role   = COALESCE($3, role),
         status = COALESCE($4, status)
       WHERE id = $5
       RETURNING id, name, email, username, role, status`,
      [name, email, role, status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found." });
    res.json(rows[0]);
  } catch (err) {
    console.error("[users PUT /:id]", err.message);
    res.status(500).json({ error: "Failed to update user." });
  }
});

// DELETE /api/users/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    // prevent self-deletion
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: "User not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("[users DELETE /:id]", err.message);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

module.exports = router;
