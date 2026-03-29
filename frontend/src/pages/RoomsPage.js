import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import { roomApi } from "../services/api";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    room_number: "",
    type: "Single",
    status: "Available",
  });
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const fetchRooms = async () => {
    const response = await roomApi.getAll();
    setRooms(response.data);
  };

  useEffect(() => {
    fetchRooms().catch((error) => console.error("Rooms fetch failed:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await roomApi.create(formData);
      setFormData({ room_number: "", type: "Single", status: "Available" });
      setAlert({ message: "Room added successfully.", type: "success" });
      fetchRooms();
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Unable to add room.", type: "error" });
    }
  };

  return (
    <section>
      <PageHeader title="Rooms" description="Create rooms and monitor occupancy status." />
      <Alert alert={alert} onClose={() => setAlert({ message: "", type: "success" })} />

      <div className="content-grid two-column">
        <div className="panel">
          <h4>Add Room</h4>
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
              Status
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              Add Room
            </button>
          </form>
        </div>

        <div className="panel">
          <h4>Room List</h4>
          <div className="room-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-card-header">
                  <h5>{room.room_number}</h5>
                  <span className={`badge ${room.status === "Available" ? "badge-green" : "badge-red"}`}>
                    {room.status}
                  </span>
                </div>
                <p>{room.type} Room</p>
                <small>{room.allocated_students} student(s) allocated</small>
              </div>
            ))}
            {!rooms.length && <div className="empty-room-card">No rooms found.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoomsPage;
