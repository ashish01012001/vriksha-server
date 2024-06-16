const jwt = require("jsonwebtoken");
const User = require("../models/users");
const secret = "jabjcnjajcobadcb";
module.exports = async function (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decode = jwt.verify(token, secret);
    const user = await User.findUser(decode.emailId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    console.log("OKKK")
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
