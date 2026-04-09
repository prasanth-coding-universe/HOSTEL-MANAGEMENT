import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import { roomApi, wardenApi } from "../services/api";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [formData, setFormData] = useState({
    room_number: "",
    type: "Single",
    warden_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("All");
  const [occupancyFilter, setOccupancyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("room-asc");
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const fetchRooms = async () => {
    const response = await roomApi.getAll();
    setRooms(response.data);
  };

  const fetchWardens = async () => {
    const response = await wardenApi.getAll();
    setWardens(response.data);
  };

  useEffect(() => {
    fetchRooms().catch((error) => console.error("Rooms fetch failed:", error));
    fetchWardens().catch((error) => console.error("Wardens fetch failed:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await roomApi.update(editingId, formData);
        setAlert({ message: "Room updated successfully.", type: "success" });
      } else {
        await roomApi.create({ ...formData, status: "Available" });
        setAlert({ message: "Room added successfully.", type: "success" });
      }
      setFormData({ room_number: "", type: "Single", warden_id: "" });
      setEditingId(null);
      fetchRooms();
    } catch (error) {
      setAlert({
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to add room.",
        type: "error",
      });
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setFormData({
      room_number: room.room_number,
      type: room.type,
      warden_id: room.warden_id || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ room_number: "", type: "Single", warden_id: "" });
  };

  const handleWardenAssign = async (roomId, wardenId) => {
    try {
      await roomApi.assignWarden(roomId, { warden_id: wardenId || null });
      setAlert({ message: "Warden assignment updated.", type: "success" });
      fetchRooms();
    } catch (error) {
      setAlert({
        message: error.response?.data?.message || "Unable to assign warden.",
        type: "error",
      });
    }
  };

  const filteredRooms = [...rooms]
    .filter((room) => {
      const query = searchTerm.trim().toLowerCase();
      const matchesQuery =
        !query ||
        room.room_number.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        (room.warden_name || "").toLowerCase().includes(query);
      const matchesType = roomTypeFilter === "All" || room.type === roomTypeFilter;
      const matchesOccupancy =
        occupancyFilter === "All" || room.occupancy_state === occupancyFilter;
      return matchesQuery && matchesType && matchesOccupancy;
    })
    .sort((first, second) => {
      if (sortBy === "room-desc") return second.room_number.localeCompare(first.room_number);
      if (sortBy === "capacity-desc") return Number(second.capacity) - Number(first.capacity);
      if (sortBy === "occupancy-desc") {
        return Number(second.allocated_students) - Number(first.allocated_students);
      }
      return first.room_number.localeCompare(second.room_number);
    });

  return (
    <section>
      <PageHeader title="Rooms" description="Create rooms and monitor occupancy status." />
      <Alert alert={alert} onClose={() => setAlert({ message: "", type: "success" })} />

      <div className="content-grid two-column">
        <div className="panel">
          <h4>{editingId ? "Edit Room" : "Add Room"}</h4>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Room Number
              <input
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Room Type
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
              </select>
            </label>
            <label>
              Assigned Warden
              <select name="warden_id" value={formData.warden_id} onChange={handleChange}>
                <option value="">Select warden</option>
                {wardens.map((warden) => (
                  <option key={warden.id} value={warden.id}>
                    {warden.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" type="submit">
              {editingId ? "Update Room" : "Add Room"}
            </button>
            {editingId && (
              <button className="ghost-button" type="button" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="panel">
          <h4>Room List</h4>
          <div className="toolbar toolbar-grid">
            <input
              placeholder="Search by room no, type, or warden"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select value={roomTypeFilter} onChange={(event) => setRoomTypeFilter(event.target.value)}>
              <option value="All">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
            </select>
            <select value={occupancyFilter} onChange={(event) => setOccupancyFilter(event.target.value)}>
              <option value="All">All Occupancy</option>
              <option value="Available">Available</option>
              <option value="Partially Occupied">Partially Occupied</option>
              <option value="Fully Occupied">Fully Occupied</option>
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="room-asc">Room No A-Z</option>
              <option value="room-desc">Room No Z-A</option>
              <option value="capacity-desc">Highest Capacity</option>
              <option value="occupancy-desc">Most Occupied</option>
            </select>
          </div>
          <div className="room-grid">
            {filteredRooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-card-header">
                  <h5>{room.room_number}</h5>
                  <span
                    className={`badge ${
                      room.occupancy_state === "Available"
                        ? "badge-green"
                        : room.occupancy_state === "Partially Occupied"
                          ? "badge-gold"
                          : "badge-red"
                    }`}
                  >
                    {room.occupancy_state}
                  </span>
                </div>
                <p>{room.type} Room</p>
                <small>
                  {room.allocated_students}/{room.capacity || 1} student(s) allocated
                </small>
                <p className="room-meta">
                  Warden: {room.warden_name ? `${room.warden_name} (${room.warden_phone})` : "Not Assigned"}
                </p>
                <div className="room-actions">
                  <button className="ghost-button" type="button" onClick={() => handleEdit(room)}>
                    Edit Room
                  </button>
                  <span className="room-capacity-note">Capacity {room.capacity || 1}</span>
                </div>
                <label className="compact-label">
                  Change Warden
                  <select
                    value={room.warden_id || ""}
                    onChange={(event) => handleWardenAssign(room.id, event.target.value)}
                  >
                    <option value="">Unassign</option>
                    {wardens.map((warden) => (
                      <option key={warden.id} value={warden.id}>
                        {warden.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
            {!filteredRooms.length && <div className="empty-room-card">No rooms found.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoomsPage;
