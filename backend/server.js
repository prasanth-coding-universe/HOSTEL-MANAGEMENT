const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const roomRoutes = require("./routes/rooms");
const wardenRoutes = require("./routes/wardens");
const allocationRoutes = require("./routes/allocations");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ message: "Backend is running." });
  } catch (error) {
    return res.status(500).json({ message: "Database connection failed.", error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/wardens", wardenRoutes);
app.use("/api/allocations", allocationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
