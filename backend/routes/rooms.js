const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { room_number, type, status } = req.body;

    if (!room_number || !type || !status) {
      return res
        .status(400)
        .json({ message: "Room number, type, and status are required." });
    }

    const [result] = await pool.query(
      "INSERT INTO Rooms (room_number, type, status) VALUES (?, ?, ?)",
      [room_number, type, status]
    );

    const [rows] = await pool.query("SELECT * FROM Rooms WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add room.", error: error.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*,
              COUNT(a.id) AS allocated_students
       FROM Rooms r
       LEFT JOIN Allocations a ON a.room_id = r.id
       GROUP BY r.id
       ORDER BY r.room_number ASC`
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch rooms.", error: error.message });
  }
});

module.exports = router;
