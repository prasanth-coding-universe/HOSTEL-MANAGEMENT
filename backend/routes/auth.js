const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: "All signup fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const username = email.split("@")[0];
    const [existingUsers] = await pool.query(
      "SELECT id FROM Users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUsers.length) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO Users (full_name, email, phone, username, password_hash, role)
       VALUES (?, ?, ?, ?, ?, 'admin')`,
      [fullName, email, phone, username, passwordHash]
    );

    return res.status(201).json({
      message: "Account created successfully. Please log in.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Signup failed:", error);
    return res.status(500).json({ message: "Signup failed.", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/username and password are required." });
    }

    const [users] = await pool.query(
      `SELECT id, full_name, email, phone, username, role, password_hash
       FROM Users
       WHERE email = ? OR username = ?`,
      [identifier, identifier]
    );

    if (!users.length) {
      return res.status(401).json({ message: "Invalid email/username or password." });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid email/username or password." });
    }

    return res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
});

module.exports = router;
