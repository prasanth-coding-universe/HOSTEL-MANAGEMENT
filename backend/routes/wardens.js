const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required." });
    }

    const [result] = await pool.query(
      "INSERT INTO Wardens (name, phone) VALUES (?, ?)",
      [name, phone]
    );

    const [rows] = await pool.query("SELECT * FROM Wardens WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Failed to add warden:", error);
    return res.status(500).json({ message: "Failed to add warden.", error: error.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Wardens ORDER BY id DESC");
    return res.json(rows);
  } catch (error) {
    console.error("Failed to fetch wardens:", error);
    return res.status(500).json({ message: "Failed to fetch wardens.", error: error.message });
  }
});

module.exports = router;
