import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import { studentApi } from "../services/api";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const fetchStudents = async () => {
    const response = await studentApi.getAll();
    setStudents(response.data);
  };

  useEffect(() => {
    fetchStudents().catch((error) => console.error("Students fetch failed:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await studentApi.update(editingId, formData);
        setAlert({ message: "Student updated successfully.", type: "success" });
      } else {
        await studentApi.create(formData);
        setAlert({ message: "Student added successfully.", type: "success" });
      }
      setFormData({ name: "", phone: "" });
      setEditingId(null);
      await fetchStudents();
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Unable to add student.", type: "error" });
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({ name: student.name, phone: student.phone });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "" });
  };

  const handleDelete = async (id) => {
    try {
      await studentApi.remove(id);
      setAlert({ message: "Student deleted successfully.", type: "success" });
      await fetchStudents();
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Unable to delete student.", type: "error" });
    }
  };

  const filteredStudents = [...students]
    .filter((student) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return (
        student.name.toLowerCase().includes(query) ||
        student.phone.toLowerCase().includes(query) ||
        (student.room_number || "").toLowerCase().includes(query)
      );
    })
    .sort((first, second) => {
      if (sortBy === "name-asc") return first.name.localeCompare(second.name);
      if (sortBy === "name-desc") return second.name.localeCompare(first.name);
      return second.id - first.id;
    });

  return (
    <section>
      <PageHeader title="Students" description="Add, view, and remove student records." />
      <Alert alert={alert} onClose={() => setAlert({ message: "", type: "success" })} />

      <div className="content-grid two-column">
        <div className="panel">
          <h4>{editingId ? "Edit Student" : "Add Student"}</h4>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Full Name
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={formData.phone} onChange={handleChange} required />
            </label>
            <button className="primary-button" type="submit">
              {editingId ? "Update Student" : "Add Student"}
            </button>
            {editingId && (
              <button className="ghost-button" type="button" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="panel">
          <h4>Student List</h4>
          <div className="toolbar">
            <input
              placeholder="Search by name, phone, or room"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="latest">Latest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Room</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.phone}</td>
                    <td>{student.room_number || "Not Assigned"}</td>
                    <td>
                      <button className="ghost-button" type="button" onClick={() => handleEdit(student)}>
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredStudents.length && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No students found.
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

export default StudentsPage;
