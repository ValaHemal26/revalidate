const jwt = require("jsonwebtoken");

function verifyAdminToken  (req, res, next)  {
  try {
    const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    req.admin = decoded; 
    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyAdminToken;
module.exports = verifyToken;