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
      "INSERT INTO Students (name, phone) VALUES (?, ?)",
      [name, phone]
    );

    const [rows] = await pool.query("SELECT * FROM Students WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add student.", error: error.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.phone, r.room_number
       FROM Students s
       LEFT JOIN Allocations a ON a.student_id = s.id
       LEFT JOIN Rooms r ON r.id = a.room_id
       ORDER BY s.id DESC`
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch students.", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM Students WHERE id = ?", [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.json({ message: "Student deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete student.", error: error.message });
  }
});

module.exports = router;
