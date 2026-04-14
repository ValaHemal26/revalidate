// ============================
// Authentication Middleware
// ============================
// This middleware checks if the user is logged in by verifying
// their JWT token. It also checks if the user has the right role.

const jwt = require("jsonwebtoken");

// --- Verify Token ---
// Checks that the request has a valid JWT token in the Authorization header.
// If valid, attaches the user data (id, role) to req.user.
const verifyToken = (req, res, next) => {
  // Get the token from the "Authorization: Bearer <token>" header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to the request object so routes can use it
    req.user = decoded;
    next(); // Continue to the next middleware/route
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// --- Authorize Roles ---
// Creates a middleware that only allows users with specific roles.
// Usage: authorizeRoles("admin", "operator")
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
