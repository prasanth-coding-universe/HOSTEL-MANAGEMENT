import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { allocationApi, roomApi, studentApi } from "../services/api";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalAllocations: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [studentsRes, roomsRes, allocationsRes] = await Promise.all([
        studentApi.getAll(),
        roomApi.getAll(),
        allocationApi.getAll(),
      ]);

      const rooms = roomsRes.data;

      setStats({
        totalStudents: studentsRes.data.length,
        totalRooms: rooms.length,
        availableRooms: rooms.filter((room) => room.status === "Available").length,
        occupiedRooms: rooms.filter((room) => room.status === "Occupied").length,
        totalAllocations: allocationsRes.data.length,
      });
    };

    fetchData().catch((error) => console.error("Dashboard fetch failed:", error));
  }, []);

  return (
    <section>
      <PageHeader
        title="Overview"
        description="Track occupancy and hostel records in real time."
      />

      <div className="stats-grid">
        <StatCard label="Total Students" value={stats.totalStudents} accent="accent-blue" />
        <StatCard label="Total Rooms" value={stats.totalRooms} accent="accent-gold" />
        <StatCard label="Available Rooms" value={stats.availableRooms} accent="accent-green" />
        <StatCard label="Occupied Rooms" value={stats.occupiedRooms} accent="accent-red" />
      </div>

      <div className="panel highlight-panel">
        <div>
          <span className="eyebrow">Live Snapshot</span>
          <h3>{stats.totalAllocations} active allocations recorded</h3>
          <p>Use the sidebar to add new records, assign rooms, and keep the hostel database updated.</p>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
