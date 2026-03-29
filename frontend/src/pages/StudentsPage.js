import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import { studentApi } from "../services/api";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });
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
      await studentApi.create(formData);
      setFormData({ name: "", phone: "" });
      setAlert({ message: "Student added successfully.", type: "success" });
      await fetchStudents();
    } catch (error) {
      setAlert({ message: error.response?.data?.message || "Unable to add student.", type: "error" });
    }
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

  return (
    <section>
      <PageHeader title="Students" description="Add, view, and remove student records." />
      <Alert alert={alert} onClose={() => setAlert({ message: "", type: "success" })} />

      <div className="content-grid two-column">
        <div className="panel">
          <h4>Add Student</h4>
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
              Add Student
            </button>
          </form>
        </div>

        <div className="panel">
          <h4>Student List</h4>
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
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.phone}</td>
                    <td>{student.room_number || "Not Assigned"}</td>
                    <td>
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
                {!students.length && (
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
