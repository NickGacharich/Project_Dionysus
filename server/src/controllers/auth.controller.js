
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "15m", algorithm: "HS256" }
  );
};

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  displayName: user.displayName || user.username,
  email: user.email,
  avatar: user.avatar || "avatar-1",
  role: user.role,
  createdAt: user.createdAt,
});

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        message: "Username must be 3-30 characters long.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 254
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    // bcrypt only processes up to 72 bytes of a password.
    if (
      password.length < 12 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters and no more than 72 UTF-8 bytes.",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Unable to register with that email address.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: publicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Unable to register with that email address.",
      });
    }

    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 254 ||
      password.length > 1024
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (
      !user ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.json({
      message: "Login successful.",
      user: publicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.sub;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.sub;
    const { displayName, avatar } = req.body;

    const allowedAvatars = [
      "avatar-1",
      "avatar-2",
      "avatar-3",
      "avatar-4",
      "avatar-5",
      "avatar-6",
      "avatar-7",
      "avatar-8",
    ];

    if (
      typeof displayName !== "string" ||
      displayName.trim().length < 3 ||
      displayName.trim().length > 40
    ) {
      return res.status(400).json({
        message: "Display name must be 3-40 characters long.",
      });
    }

    if (
      typeof avatar !== "string" ||
      !allowedAvatars.includes(avatar)
    ) {
      return res.status(400).json({
        message: "Please select a valid avatar.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          displayName: displayName.trim(),
          avatar,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};