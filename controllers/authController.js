const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashPassword,
    });
    req.session.user = newUser;
    res.status(201).json({
      status: "Success",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "Fail",
    });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  const foundUser = await User.findOne({ username: username }).exec();
  if (!foundUser) return res.status(401).json({ message: "Not found" }); //Unauthorized
  try {
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
      req.session.user = foundUser;
      console.log(req.session.user);
      res.status(200).json({ message: "Success, you're logged in" });
    }
  } catch (e) {
    res.status(400).json({
      status: "Fail",
    });
  }
};
