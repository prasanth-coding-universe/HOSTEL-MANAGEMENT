const express = require("express");
const pool = require("../config/db");

const router = express.Router();
const ROOM_CAPACITY = {
  Single: 1,
  Double: 2,
  Triple: 3,
};

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
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [allocationRows] = await connection.query(
      `SELECT a.room_id, r.type
       FROM Allocations a
       JOIN Rooms r ON r.id = a.room_id
       WHERE a.student_id = ?`,
      [id]
    );

    const [result] = await connection.query("DELETE FROM Students WHERE id = ?", [id]);

    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found." });
    }

    if (allocationRows.length) {
      const { room_id: roomId, type } = allocationRows[0];
      const capacity = ROOM_CAPACITY[type] || 1;
      const [remainingRows] = await connection.query(
        "SELECT COUNT(*) AS total FROM Allocations WHERE room_id = ?",
        [roomId]
      );
      const remaining = remainingRows[0].total;
      const nextStatus = remaining >= capacity ? "Occupied" : "Available";

      await connection.query("UPDATE Rooms SET status = ? WHERE id = ?", [nextStatus, roomId]);
    }

    await connection.commit();
    return res.json({ message: "Student deleted successfully." });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Failed to delete student.", error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
