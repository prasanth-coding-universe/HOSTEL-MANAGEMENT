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
    const { room_number, type, status, warden_id } = req.body;

    if (!room_number || !type || !status) {
      return res
        .status(400)
        .json({ message: "Room number, type, and status are required." });
    }

    if (warden_id) {
      const [wardens] = await pool.query("SELECT id FROM Wardens WHERE id = ?", [warden_id]);

      if (!wardens.length) {
        return res.status(400).json({ message: "Selected warden does not exist." });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO Rooms (room_number, type, status, warden_id) VALUES (?, ?, ?, ?)",
      [room_number, type, status, warden_id || null]
    );

    const [rows] = await pool.query(
      `SELECT r.*, w.name AS warden_name, w.phone AS warden_phone
       FROM Rooms r
       LEFT JOIN Wardens w ON w.id = r.warden_id
       WHERE r.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add room.", error: error.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*,
              COUNT(a.id) AS allocated_students,
              w.name AS warden_name,
              w.phone AS warden_phone
       FROM Rooms r
       LEFT JOIN Wardens w ON w.id = r.warden_id
       LEFT JOIN Allocations a ON a.room_id = r.id
       GROUP BY r.id
       ORDER BY r.room_number ASC`
    );

    return res.json(
      rows.map((room) => ({
        ...room,
        capacity: ROOM_CAPACITY[room.type] || 1,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch rooms.", error: error.message });
  }
});

router.put("/:id/warden", async (req, res) => {
  try {
    const { id } = req.params;
    const { warden_id } = req.body;

    if (warden_id) {
      const [wardens] = await pool.query("SELECT id FROM Wardens WHERE id = ?", [warden_id]);

      if (!wardens.length) {
        return res.status(400).json({ message: "Selected warden does not exist." });
      }
    }

    const [result] = await pool.query("UPDATE Rooms SET warden_id = ? WHERE id = ?", [
      warden_id || null,
      id,
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Room not found." });
    }

    const [rows] = await pool.query(
      `SELECT r.*, w.name AS warden_name, w.phone AS warden_phone
       FROM Rooms r
       LEFT JOIN Wardens w ON w.id = r.warden_id
       WHERE r.id = ?`,
      [id]
    );

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to assign warden.", error: error.message });
  }
});

module.exports = router;
