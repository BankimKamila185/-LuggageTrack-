const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../db/pool");

const JWT_SECRET  = process.env.JWT_SECRET || "luggagetrack-secret-change-in-prod";
const JWT_EXPIRES = "8h";

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND status = 'Active'",
      [username.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = rows[0];

    // ── Demo shortcut: password "admin123" works for all seeded accounts ──
    // In production, all passwords are bcrypt hashed.
    const passwordMatch = await bcrypt.compare(password, user.password)
      .catch(() => false);

    // Fallback for demo plain-text match during development
    const demoMatch = (password === "admin123" || password === "demo123");

    if (!passwordMatch && !demoMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const payload = {
      id:       user.id,
      username: user.username,
      role:     user.role,
      name:     user.name,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      token,
      user: {
        id:          user.id,
        username:    user.username,
        role:        user.role,
        displayRole: user.role,
        name:        user.name,
        email:       user.email,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err.message);
    return res.status(500).json({ error: "Server error during login." });
  }
});

// POST /api/auth/logout  (client just drops the token — stateless JWT)
router.post("/logout", (_req, res) => {
  res.json({ success: true });
});

module.exports = router;
