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
    console.error("Failed to add room:", error);
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
        occupancy_state:
          Number(room.allocated_students) === 0
            ? "Available"
            : Number(room.allocated_students) >= (ROOM_CAPACITY[room.type] || 1)
              ? "Fully Occupied"
              : "Partially Occupied",
      }))
    );
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return res.status(500).json({ message: "Failed to fetch rooms.", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, type, warden_id } = req.body;

    if (!room_number || !type) {
      return res.status(400).json({ message: "Room number and type are required." });
    }

    if (warden_id) {
      const [wardens] = await pool.query("SELECT id FROM Wardens WHERE id = ?", [warden_id]);

      if (!wardens.length) {
        return res.status(400).json({ message: "Selected warden does not exist." });
      }
    }

    const [duplicateRooms] = await pool.query(
      "SELECT id FROM Rooms WHERE room_number = ? AND id <> ?",
      [room_number, id]
    );

    if (duplicateRooms.length) {
      return res.status(409).json({ message: "Room number already exists." });
    }

    const [allocationRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM Allocations WHERE room_id = ?",
      [id]
    );
    const allocatedStudents = Number(allocationRows[0].total);
    const capacity = ROOM_CAPACITY[type] || 1;

    if (allocatedStudents > capacity) {
      return res.status(400).json({
        message: "Cannot reduce room capacity below current allocated students.",
      });
    }

    const nextStatus = allocatedStudents >= capacity && allocatedStudents > 0 ? "Occupied" : "Available";

    const [result] = await pool.query(
      "UPDATE Rooms SET room_number = ?, type = ?, status = ?, warden_id = ? WHERE id = ?",
      [room_number, type, nextStatus, warden_id || null, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Room not found." });
    }

    const [rows] = await pool.query(
      `SELECT r.*,
              (SELECT COUNT(*) FROM Allocations a WHERE a.room_id = r.id) AS allocated_students,
              w.name AS warden_name,
              w.phone AS warden_phone
       FROM Rooms r
       LEFT JOIN Wardens w ON w.id = r.warden_id
       WHERE r.id = ?`,
      [id]
    );

    const room = rows[0];

    return res.json({
      ...room,
      capacity: ROOM_CAPACITY[room.type] || 1,
      occupancy_state:
        Number(room.allocated_students) === 0
          ? "Available"
          : Number(room.allocated_students) >= (ROOM_CAPACITY[room.type] || 1)
            ? "Fully Occupied"
            : "Partially Occupied",
    });
  } catch (error) {
    console.error("Failed to update room:", error);
    return res.status(500).json({ message: "Failed to update room.", error: error.message });
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
    console.error("Failed to assign warden:", error);
    return res.status(500).json({ message: "Failed to assign warden.", error: error.message });
  }
});

module.exports = router;
