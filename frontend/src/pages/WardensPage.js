import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import { wardenApi } from "../services/api";

function WardensPage() {
  const [wardens, setWardens] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [alert, setAlert] = useState({ message: "", type: "success" });

  const fetchWardens = async () => {
    const response = await wardenApi.getAll();
    setWardens(response.data);
  };

  useEffect(() => {
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
        await wardenApi.update(editingId, formData);
        setAlert({ message: "Warden updated successfully.", type: "success" });
      } else {
        await wardenApi.create(formData);
        setAlert({ message: "Warden added successfully.", type: "success" });
      }
      setFormData({ name: "", phone: "" });
      setEditingId(null);
      fetchWardens();
    } catch (error) {
      setAlert({
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to add warden.",
        type: "error",
      });
    }
  };

  const handleEdit = (warden) => {
    setEditingId(warden.id);
    setFormData({ name: warden.name, phone: warden.phone });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "" });
  };

  const handleDelete = async (id) => {
    try {
      await wardenApi.remove(id);
      setAlert({ message: "Warden deleted successfully.", type: "success" });
      fetchWardens();
    } catch (error) {
      setAlert({
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to delete warden.",
        type: "error",
      });
    }
  };

  const filteredWardens = [...wardens]
    .filter((warden) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return (
        warden.name.toLowerCase().includes(query) ||
        warden.phone.toLowerCase().includes(query)
      );
    })
    .sort((first, second) => {
      if (sortBy === "name-asc") return first.name.localeCompare(second.name);
      if (sortBy === "name-desc") return second.name.localeCompare(first.name);
      return second.id - first.id;
    });

  return (
    <section>
      <PageHeader title="Wardens" description="Maintain warden contact records." />
      <Alert alert={alert} onClose={() => setAlert({ message: "", type: "success" })} />

      <div className="content-grid two-column">
        <div className="panel">
          <h4>{editingId ? "Edit Warden" : "Add Warden"}</h4>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={formData.phone} onChange={handleChange} required />
            </label>
            <button className="primary-button" type="submit">
              {editingId ? "Update Warden" : "Add Warden"}
            </button>
            {editingId && (
              <button className="ghost-button" type="button" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="panel">
          <h4>Warden List</h4>
          <div className="toolbar">
            <input
              placeholder="Search by warden name or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="latest">Latest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
          <div className="list-stack">
            {filteredWardens.map((warden) => (
              <div key={warden.id} className="list-item">
                <div>
                  <strong>{warden.name}</strong>
                  <p>{warden.phone}</p>
                </div>
                <div className="warden-actions">
                  <span className="badge badge-green">Available for Assignment</span>
                  <button className="ghost-button" type="button" onClick={() => handleEdit(warden)}>
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => handleDelete(warden.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!filteredWardens.length && <div className="empty-state">No wardens found.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WardensPage;
