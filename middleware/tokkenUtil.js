import jwt from "jsonwebtoken";

function verifyToken(token, secretKey) {
  try {
    const payload = jwt.verify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}

const verifyResetToken = (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ message: "Token not provided." });
  }

  const secretKey = "woodbone201300";

  const payload = verifyToken(token, secretKey);

  if (!payload) {
    res.status(401).send({ message: "Invalid or expired token." });
  }
  next();
};

export default verifyResetToken;
