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
 try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {

      token = authHeader.split(" ")[1];
     
    }


    if (!token && req.headers.cookie) {
      const cookieArr = req.headers.cookie.split(";");

      const tokenCookie = cookieArr.find(c =>
        c.trim().startsWith("userToken=")
      );

      if (tokenCookie) {
        token = tokenCookie.split("=")[1];
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
   
    next();
  } catch(err) {
    console.log(err);
    return res.status(401).json({ success: false,err });
  }
}
module.exports = {
  verifyAdminToken,
  verifyToken
};