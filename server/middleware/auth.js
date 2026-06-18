const jwt  = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "luggagetrack-secret-change-in-prod";

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
