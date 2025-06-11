const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const header = req.header("Authorization");
  console.log("Authorization header:", header);

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      status: false,
      message: "Authorization header missing or invalid",
      code: 401,
    });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, name: payload.name };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid or expired token", code: 401 });
  }
};
