import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      const response = await authApi.login(formData);

      localStorage.setItem("hostel-auth", "true");
      localStorage.setItem("hostel-user", JSON.stringify(response.data.user));
      navigate("/dashboard", { replace: true });
    } catch (apiError) {
      setError(
        apiError.response?.data?.error ||
          apiError.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div>
          <span className="eyebrow">Welcome Back</span>
          <h1>Staynix Hostel</h1>
          <p>Log in with your registered email or username to access the admin dashboard.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email / Username
            <input
              name="identifier"
              placeholder="Enter email or username"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="inline-error">{error}</div>}

          <button className="primary-button" type="submit">
            {isSubmitting ? "Checking..." : "Login"}
          </button>

          <p className="auth-switch">
            No account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
