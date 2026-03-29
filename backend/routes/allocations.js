const express = require("express");
const pool = require("../config/db");

const router = express.Router();
const ROOM_CAPACITY = {
  Single: 1,
  Double: 2,
  Triple: 3,
};

router.post("/", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { student_id, room_id } = req.body;

    if (!student_id || !room_id) {
      return res.status(400).json({ message: "Student and room are required." });
    }

    await connection.beginTransaction();

    const [studentAllocations] = await connection.query(
      "SELECT id FROM Allocations WHERE student_id = ?",
      [student_id]
    );

    if (studentAllocations.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Student is already allocated to a room." });
    }

    const [roomRows] = await connection.query("SELECT * FROM Rooms WHERE id = ?", [room_id]);

    if (!roomRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Room not found." });
    }

    const room = roomRows[0];
    const capacity = ROOM_CAPACITY[room.type] || 1;
    const [allocationCountRows] = await connection.query(
      "SELECT COUNT(*) AS total FROM Allocations WHERE room_id = ?",
      [room_id]
    );
    const allocatedCount = allocationCountRows[0].total;

    if (allocatedCount >= capacity) {
      await connection.rollback();
      return res.status(400).json({ message: "Selected room is already full." });
    }

    const [result] = await connection.query(
      "INSERT INTO Allocations (student_id, room_id) VALUES (?, ?)",
      [student_id, room_id]
    );

    const updatedCount = allocatedCount + 1;
    const nextStatus = updatedCount >= capacity ? "Occupied" : "Available";
    await connection.query("UPDATE Rooms SET status = ? WHERE id = ?", [nextStatus, room_id]);

    await connection.commit();

    const [rows] = await connection.query(
      `SELECT a.id, s.name AS student_name, r.room_number
       FROM Allocations a
       JOIN Students s ON s.id = a.student_id
       JOIN Rooms r ON r.id = a.room_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Failed to create allocation.", error: error.message });
  } finally {
    connection.release();
  }
});

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, s.name AS student_name, s.phone, r.room_number, r.type
       FROM Allocations a
       JOIN Students s ON s.id = a.student_id
       JOIN Rooms r ON r.id = a.room_id
       ORDER BY a.id DESC`
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch allocations.", error: error.message });
  }
});

module.exports = router;
