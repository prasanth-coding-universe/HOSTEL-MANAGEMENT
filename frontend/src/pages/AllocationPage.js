import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import { allocationApi, roomApi, studentApi } from "../services/api";

function AllocationPage() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [formData, setFormData] = useState({ student_id: "", room_id: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const fetchData = async () => {
    const [studentsRes, roomsRes, allocationsRes] = await Promise.all([
      studentApi.getAll(),
      roomApi.getAll(),
      allocationApi.getAll(),
    ]);

    setStudents(studentsRes.data.filter((student) => !student.room_number));
    setRooms(
      roomsRes.data.filter((room) => Number(room.allocated_students) < Number(room.capacity || 1))
    );
    setAllocations(allocationsRes.data);
  };

  useEffect(() => {
    fetchData().catch((error) => console.error("Allocation fetch failed:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await allocationApi.create(formData);
      setFormData({ student_id: "", room_id: "" });
      setAlert({ message: "Room allocated successfully.", type: "success" });
      fetchData();
    } catch (error) {
      setAlert({
        message: error.response?.data?.message || "Unable to allocate room.",
        type: "error",
      });
    }
  };

  const filteredAllocations = allocations.filter((allocation) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      allocation.student_name.toLowerCase().includes(query) ||
      allocation.phone.toLowerCase().includes(query) ||
      allocation.room_number.toLowerCase().includes(query) ||
      allocation.type.toLowerCase().includes(query)
    );
  });

  return (
    <section>
      <PageHeader
        title="Room Allocation"
        description="Assign available rooms to students using live dropdown data."
      />
      <Alert alert={alert} onClose={() => setAlert({ message: "", type: "success" })} />

      <div className="content-grid two-column">
        <div className="panel">
          <h4>Assign Student To Room</h4>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Student
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Room
              <select name="room_id" value={formData.room_id} onChange={handleChange} required>
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_number} ({room.type}, {room.allocated_students}/{room.capacity})
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button" type="submit">
              Assign Room
            </button>
          </form>
        </div>

        <div className="panel">
          <h4>Allocation Records</h4>
          <div className="toolbar">
            <input
              placeholder="Search by student, phone, room, or type"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Phone</th>
                  <th>Room</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td>{allocation.id}</td>
                    <td>{allocation.student_name}</td>
                    <td>{allocation.phone}</td>
                    <td>{allocation.room_number}</td>
                    <td>{allocation.type}</td>
                  </tr>
                ))}
                {!filteredAllocations.length && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No allocations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AllocationPage;
