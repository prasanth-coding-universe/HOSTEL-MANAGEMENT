import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authApi.signup(formData);
      setSuccess(response.data.message);
      setTimeout(() => navigate("/"), 1000);
    } catch (apiError) {
      setError(
        apiError.response?.data?.error ||
          apiError.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div>
          <span className="eyebrow">Create Account</span>
          <h1>Staynix Hostel Access</h1>
          <p>Create an admin account first, then log in to manage hostel operations.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone Number
            <input
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Create Password
            <input
              name="password"
              type="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          {error && <div className="inline-error">{error}</div>}
          {success && <div className="inline-success">{success}</div>}

          <button className="primary-button" type="submit">
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
