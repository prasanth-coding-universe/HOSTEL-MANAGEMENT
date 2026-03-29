import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import { wardenApi } from "../services/api";

function WardensPage() {
  const [wardens, setWardens] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "" });
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
      await wardenApi.create(formData);
      setFormData({ name: "", phone: "" });
      setAlert({ message: "Warden added successfully.", type: "success" });
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

  return (
    <section>
      <PageHeader title="Wardens" description="Maintain warden contact records." />
      <Alert alert={alert} onClose={() => setAlert({ message: "", type: "success" })} />

      <div className="content-grid two-column">
        <div className="panel">
          <h4>Add Warden</h4>
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
              Add Warden
            </button>
          </form>
        </div>

        <div className="panel">
          <h4>Warden List</h4>
          <div className="list-stack">
            {wardens.map((warden) => (
              <div key={warden.id} className="list-item">
                <div>
                  <strong>{warden.name}</strong>
                  <p>{warden.phone}</p>
                </div>
                <span className="badge badge-green">Available for Assignment</span>
              </div>
            ))}
            {!wardens.length && <div className="empty-state">No wardens found.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WardensPage;
